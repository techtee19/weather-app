"use strict";

const apiKey = "78126b4353ba75897d3a21d99439c45b";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const temperatureEl = document.querySelector(".temperature");
const locationEl = document.querySelector(".location");
const sunsetEl = document.querySelector(".sunset");
const humidityEl = document
  .querySelectorAll(".card")[0]
  .querySelector("strong");
const sunsetTimeEl = document
  .querySelectorAll(".card")[1]
  .querySelector("strong");
const uvIndexEl = document.querySelectorAll(".card")[2].querySelector("strong");
const sunriseEl = document.querySelectorAll(".card")[3].querySelector("strong");
const rainfallEl = document.querySelector(".rainfall-box strong");
const forecastEl = document.querySelector(".forecast");

const autocompleteList = document.querySelector(".autocomplete-list");
const geoApi = "https://api.openweathermap.org/geo/1.0/direct?q=";

// Get weather by city name
const getWeatherByCity = async (city) => {
  showLoading();
  try {
    const res = await fetch(apiUrl + city + `&appid=${apiKey}`);

    const data = await res.json();
    if (!data.cod) throw new Error(data.message);

    const {
      name,
      sys: { country },
      coord: { lat, lon },
    } = data;

    getWeatherByCoords(lat, lon, `${name}, ${country}`);
  } catch (err) {
    alert("City not found or API error!");
    console.error(err);
  } finally {
    hideLoading();
  }
};

// Get weather by latitude and longitude
const getWeatherByCoords = async (lat, lon, placeName = "") => {
  showLoading();
  const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const currentData = await currentRes.json();

    if (!currentData.cod) throw new Error(currentData.message);

    const {
      main: { temp, humidity },
      sys: { country, sunrise, sunset },
      name,
    } = currentData;

    // Fetch 7-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();

    // Fill UI
    const displayName = placeName || `${name}, ${country}`;
    temperatureEl.textContent = `${Math.round(temp)}°C`;
    locationEl.textContent = displayName;
    sunsetEl.textContent = `Sunset time, ${getDayName()} ${formatTime(sunset)}`;
    humidityEl.textContent = `${humidity}%`;
    sunsetTimeEl.textContent = formatTime(sunset);
    sunriseEl.textContent = formatTime(sunrise);
    uvIndexEl.textContent = `N/A`;
    rainfallEl.textContent = "45mm";

    await minLoadingTime;
    displayForecastFromForecastAPI(forecastData);
  } catch (err) {
    console.error("Failed to fetch weather data:", err);
  } finally {
    hideLoading();
  }
};

const displayForecastFromForecastAPI = (data) => {
  forecastEl.innerHTML = "";
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daily = {};

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.getDay();
    if (!daily[day]) {
      daily[day] = {
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
      };
    }
  });

  Object.entries(daily)
    .slice(0, 7)
    .forEach(([dayIndex, { temp, icon }]) => {
      const dayEl = document.createElement("div");
      const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

      dayEl.innerHTML = `
      <p class="day">${days[dayIndex]}</p>
      <img class="weather-icon" src="${iconUrl}" alt="" />
      <p>${temp}°C</p>
      <div class = "border">
      </div>
    `;
      forecastEl.appendChild(dayEl);
    });
};

const fetchCitySuggestions = async (query) => {
  try {
    const res = await fetch(`${geoApi}${query}&limit=5&appid=${apiKey}`);
    const data = await res.json();

    autocompleteList.innerHTML = "";

    if (!data || data.length === 0) {
      autocompleteList.style.display = "none";
      return;
    }

    data.forEach((location) => {
      const item = document.createElement("div");
      item.classList.add("autocomplete-item");
      item.textContent = `${location.name}, ${location.country}`;

      item.addEventListener("click", () => {
        searchInput.value = `${location.name}`;
        autocompleteList.innerHTML = "";
        autocompleteList.style.display = "none";
        getWeatherByCoords(
          location.lat,
          location.lon,
          `${location.name}, ${location.country}`
        );
      });

      autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = "block";
  } catch (err) {
    console.error("Autocomplete fetch error:", err);
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDayName = () => {
  const date = new Date();
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) getWeatherByCity(city);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    fetchCitySuggestions(query);
  } else {
    autocompleteList.style.display = "none";
    autocompleteList.innerHTML = "";
  }
});

// Hide suggestions if clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-cont")) {
    autocompleteList.style.display = "none";
    autocompleteList.innerHTML = "";
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) getWeatherByCity(city);
    autocompleteList.style.display = "none";
    autocompleteList.innerHTML = "";
  }
});

// loading state function
function showLoading() {
  document.getElementById("loading").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// On load: get user's location
window.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (err) => {
        console.warn(
          "Geolocation error, falling back to default:",
          err.message
        );
        getWeatherByCity("Telluride"); // fallback
      }
    );
  } else {
    console.warn("Geolocation not supported. Using default location.");
    getWeatherByCity("Abuja");
  }
});
