const cityinput = document.querySelector(".city-input");
const searchbutton = document.querySelector(".search-btn");
const weathercardsdiv = document.querySelector(".weather-cards");
const currentweatherdiv = document.querySelector(".current-weather");
const currentLocationBtn = document.querySelector(".current-location-btn");
const API_KEY = "62ff641eb287688e5350a6dc252abb7a"; // API key for OpenWeather API

const createweathercard = (cityname, weatheritem, index) => {
  const date = new Date(weatheritem.dt_txt).toDateString(); // Correctly format the date
  if (index === 0) {
    // HTML for the main weather card
    return `
      <div class="details">
        <h2>${cityname} (${date})</h2>
        <h4>Temperature: ${(weatheritem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatheritem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatheritem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatheritem.weather[0].description}</h4>
      </div>`;
  } else {
    // HTML for other five-day forecast cards
    return `
      <li class="card">
        <h3>${date}</h3>
        <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${(weatheritem.main.temp - 273.15).toFixed(2)} °C</h4>
        <h4>Wind: ${weatheritem.wind.speed} m/s</h4>
        <h4>Humidity: ${weatheritem.main.humidity}%</h4>
      </li>`;
  }
};

const getWeatherDetails = (cityname, lat, lon) => {
  const weather_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(weather_API_URL)
    .then(res => {
      if (!res.ok) {
        throw new Error('Weather data fetch failed');
      }
      return res.json();
    })
    .then(data => {
      console.log(data);
      // Clear previous weather cards and current weather
      weathercardsdiv.innerHTML = '';
      currentweatherdiv.innerHTML = '';
      
      // Filter the forecast to get only one forecast per day
      const uniqueforecastdays = [];
      const fivedaysforecast = data.list.filter(forecast => {
        const forecastdate = new Date(forecast.dt_txt).getDate();
        if (!uniqueforecastdays.includes(forecastdate)) {
          uniqueforecastdays.push(forecastdate);
          return true;
        }
        return false;
      });

      // Create weather cards and add them to the DOM
      fivedaysforecast.forEach((weatheritem, index) => {
        if (index === 0) {
          currentweatherdiv.insertAdjacentHTML("beforeend", createweathercard(cityname, weatheritem, index));
        } else {
          weathercardsdiv.insertAdjacentHTML("beforeend", createweathercard(cityname, weatheritem, index));
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getcitycoordinates = () => {
  const cityname = cityinput.value.trim(); // Get user entered city name and remove extra spaces 
  if (!cityname) return; // return if city name is empty

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_KEY}`;
  
  // Get entered city coordinates (latitude, longitude, and name) from the API response
  fetch(GEOCODING_API_URL)
    .then(res => {
      if (!res.ok) {
        throw new Error('Geocoding fetch failed');
      }
      return res.json();
    })
    .then(data => {
      if (!data.length) {
        return alert(`No coordinates found for ${cityname}`);
      }
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates");
    });
};

// Function to get current location and fetch weather details
const getCurrentLocationWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherDetails('Current Location', lat, lon);
    }, () => {
      alert("Unable to retrieve your location.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

searchbutton.addEventListener("click", getcitycoordinates);
currentLocationBtn.addEventListener("click", getCurrentLocationWeather);
