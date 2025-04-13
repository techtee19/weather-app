const apiKey = "78126b4353ba75897d3a21d99439c45b";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";

// async function getWeather() {
//   const res = await fetch(apiurl + `&appid=${apiKey}`);
//   const data = await res.json();
//   console.log(data);
// }

const weather = document.querySelector(".weather");
const searchInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search-btn");
const weatherIcon = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temp");
const cityElement = document.querySelector(".city");
const humidityElement = document.querySelector(".humidity");
const windElement = document.querySelector(".wind"); // Updated to match CSS class

async function getWeather(city) {
  try {
    // document.querySelector(".error").style.display = "none";
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    console.log(data);

    // Update UI with weather data
    tempElement.innerHTML = Math.round(data.main.temp) + "°C";
    cityElement.innerHTML = data.name;
    humidityElement.innerHTML = data.main.humidity + "%";
    windElement.innerHTML = Math.round(data.wind.speed) + " km/h";

    if (data.weather[0].main === "Clouds") {
      weatherIcon.src = "cloud.png";
    } else if (data.weather[0].main === "Clear") {
      weatherIcon.src = "clear.png";
    } else if (data.weather[0].main === "Rain") {
      weatherIcon.src = "rain.png";
    } else if (data.weather[0].main === "Mist") {
      weatherIcon.src = "mist.png";
    } else if (data.weather[0].main === "Snow") {
      weatherIcon.src = "snow.png";
    } else {
      weatherIcon.src = "default.png"; // Fallback icon
    }

    weather.style.display = "block";
  } catch (error) {
    // Show error message
    document.querySelector(".error").style.display = "block";
    weather.style.display = "none";
  }
}

// Event listener for search button
searchBtn.addEventListener("click", () => {
  getWeather(searchInput.value.trim());
});

// Event listener for Enter key in search input
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    getWeather(searchInput.value.trim());
  }
});

// Initial load with default city
// getWeather();
