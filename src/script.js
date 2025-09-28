// Elements
const weatherLocation = document.getElementById("weatherLocation");
const weatherDate = document.getElementById("weatherDate");
const weatherTemp = document.getElementById("weatherLocationTemp");
const weatherFeelsLike = document.getElementById("weatherFeelsLike");
const weatherMain = document.getElementById("weatherLocationW");
const weatherDesc = document.getElementById("weatherLocationWT");
const weatherIllustration = document.getElementById("weatherIllustration");

const weatherHumidity = document.getElementById("weatherHumidity");
const weatherWind = document.getElementById("weatherWind");
const weatherUV = document.getElementById("weatherUV");
const weatherPressure = document.getElementById("weatherPressure");
const weatherVisibility = document.getElementById("weatherVisibility");

// Lottie animation instance (to destroy before loading new)
let animationInstance = null;

// Utility: Capitalize first letter
const capitalizeFirstLetter = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

// Utility: Format date nicely
function formatDate(d) {
  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleDateString(undefined, options);
}

// Load Lottie animation safely
function loadLottieAnimation(animationData) {
  if (animationInstance) animationInstance.destroy();
  animationInstance = lottie.loadAnimation({
    container: weatherIllustration,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: animationData,
  });
}

// Weather condition to Lottie JSON map
const weatherAnimations = {
  thunderstorm: "json/thunderstorm.json",
  drizzle: "json/shower.json",
  rain: "json/rain.json",
  snow: "json/snow.json",
  mist: "json/mist.json",
  smoke: "json/mist.json",
  haze: "json/mist.json",
  dust: "json/mist.json",
  fog: "json/mist.json",
  sand: "json/mist.json",
  ash: "json/mist.json",
  squall: "json/windy.json",
  tornado: "json/windy.json",
  clear: "json/clear.json",
  clouds: "json/cloudy.json",
};

// API key & endpoints
const API_KEY = "dbf076752d9f1f1b952771fbd8782ffa";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const UV_URL = "https://api.openweathermap.org/data/2.5/uvi";
const GEO_REVERSE_URL = "https://api.openweathermap.org/geo/1.0/reverse";

// Fetch UV index using lat/lon
async function fetchUVIndex(lat, lon) {
  try {
    const res = await fetch(
      `${UV_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    if (!res.ok) throw new Error("UV fetch error");
    const data = await res.json();
    return data.value;
  } catch {
    return "--";
  }
}

// Main function to fetch and render weather
async function fetchAndRenderWeather(lat, lon) {
  try {
    // Reverse geocode to get city name & country
    const geoRes = await fetch(
      `${GEO_REVERSE_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );
    if (!geoRes.ok) throw new Error("Location fetch failed");
    const geoData = await geoRes.json();
    const city = geoData[0]?.name || "Unknown Location";
    const country = geoData[0]?.country || "";

    // Fetch weather data
    const weatherRes = await fetch(
      `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    if (!weatherRes.ok) throw new Error("Weather fetch failed");
    const weather = await weatherRes.json();

    // Fetch UV index
    const uvIndex = await fetchUVIndex(lat, lon);

    // Set location
    weatherLocation.textContent = `${city}, ${country}`;

    // Set date/time
    weatherDate.textContent = formatDate(new Date());

    // Set temps
    weatherTemp.textContent = `${Math.round(weather.main.temp)}°`;
    weatherFeelsLike.textContent = `${Math.round(
      weather.main.feels_like
    )}°`;

    // Weather main and description
    weatherMain.textContent = capitalizeFirstLetter(weather.weather[0].main);
    weatherDesc.textContent = capitalizeFirstLetter(
      weather.weather[0].description
    );

    // Details
    weatherHumidity.textContent = `${weather.main.humidity}%`;
    weatherWind.textContent = `${Math.round(weather.wind.speed * 3.6)} km/h`; // m/s to km/h
    weatherUV.textContent = uvIndex === "--" ? "--" : uvIndex.toFixed(1);
    weatherPressure.textContent = `${weather.main.pressure} hPa`;
    weatherVisibility.textContent = `${(weather.visibility / 1000).toFixed(
      1
    )} km`;

    // Choose Lottie animation JSON path based on weather condition
    const weatherCondition = weather.weather[0].main.toLowerCase();
    const animationPath =
      weatherAnimations[weatherCondition] || weatherAnimations["clear"];

    // Fetch Lottie JSON and load animation
    const animRes = await fetch(animationPath);
    if (!animRes.ok) throw new Error("Animation load failed");
    const animData = await animRes.json();
    loadLottieAnimation(animData);
  } catch (err) {
    alert("Failed to fetch weather: " + err.message);
    console.error(err);
  }
}

// Get geolocation and trigger weather fetch
function initWeatherApp() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchAndRenderWeather(pos.coords.latitude, pos.coords.longitude);
    },
    (err) => {
      alert(
        "Geolocation permission denied or unavailable. Please allow location access."
      );
      console.error(err);
    }
  );
}

// Initialize on page load
window.addEventListener("load", () => {
  initWeatherApp();
});
