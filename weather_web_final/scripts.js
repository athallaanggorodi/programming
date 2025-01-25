document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '88278e68fe3476da032da526af6aa268';
    const airQualityApiKey = '88278e68fe3476da032da526af6aa268';
    const weatherIcon = document.getElementById('weather-icon');
    const weatherDescription = document.getElementById('weather-description');
    const tempValue = document.getElementById('temp-value');
    const toggleTemp = document.getElementById('toggle-temp');
    const cityInput = document.getElementById('city-input');
    const searchCity = document.getElementById('search-city');
    const forecastData = document.getElementById('forecast-data');
    const locationDisplay = document.getElementById('location');
    const timeValue = document.getElementById('time-value');
    const addToFavorites = document.getElementById('add-to-favorites');
    const clearFavoritesBtn = document.getElementById('clear-favorites');
    
    // Additional conditions
    const pressureDisplay = document.getElementById('pressure');
    const visibilityDisplay = document.getElementById('visibility');
    const cloudCoverDisplay = document.getElementById('cloud-cover');
    const humidityDisplay = document.getElementById('humidity');

    // Air Quality
    const regionSelect = document.getElementById('region-select');
    const fetchAirQualityBtn = document.getElementById('fetch-air-quality');
    const aqiDisplay = document.getElementById('aqi');
    const pm25DataDisplay = document.getElementById('pm25');
    const pm10DataDisplay = document.getElementById('pm10');
    const ukTable = document.getElementById('uk-table');
    const europeTable = document.getElementById('europe-table');
    const usaTable = document.getElementById('usa-table');
    
    let currentTempCelsius = true;
    let forecastChart;

    const iconMap = {
        '01d': { icon: 'wi-day-sunny', color: 'sunny' },
        '01n': { icon: 'wi-night-clear', color: 'clear' },
        '02d': { icon: 'wi-day-cloudy', color: 'cloudy' },
        '02n': { icon: 'wi-night-alt-cloudy', color: 'cloudy' },
        '03d': { icon: 'wi-cloud', color: 'cloudy' },
        '03n': { icon: 'wi-cloud', color: 'cloudy' },
        '04d': { icon: 'wi-cloudy', color: 'cloudy' },
        '04n': { icon: 'wi-cloudy', color: 'cloudy' },
        '09d': { icon: 'wi-rain', color: 'rainy' },
        '09n': { icon: 'wi-rain', color: 'rainy' },
        '10d': { icon: 'wi-day-rain', color: 'rainy' },
        '10n': { icon: 'wi-night-rain', color: 'rainy' },
        '11d': { icon: 'wi-thunderstorm', color: 'stormy' },
        '11n': { icon: 'wi-thunderstorm', color: 'stormy' },
        '13d': { icon: 'wi-snow', color: 'snowy' },
        '13n': { icon: 'wi-snow', color: 'snowy' },
        '50d': { icon: 'wi-fog', color: 'foggy' },
        '50n': { icon: 'wi-fog', color: 'foggy' }
    };

    const fetchWeather = (city) => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                const temp = data.main.temp;
                const weather = data.weather[0].main;
                const icon = data.weather[0].icon;
                const locationName = data.name;
                const timezoneOffset = data.timezone;
                const lat = data.coord.lat;
                const lon = data.coord.lon;

                const iconData = iconMap[icon];
                if (weatherIcon) weatherIcon.className = `wi ${iconData.icon} ${iconData.color}`;
                if (weatherDescription) weatherDescription.textContent = weather;
                if (tempValue) tempValue.textContent = `${temp}°C`;
                if (locationDisplay) locationDisplay.textContent = locationName;
                currentTempCelsius = true;

                updateTime(timezoneOffset);
                updateAdditionalConditions(data);
                fetchAirQuality(lat, lon);
                fetchForecast(city);
            });
    };

    const fetchWeatherByCoords = (lat, lon) => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                const temp = data.main.temp;
                const weather = data.weather[0].main;
                const icon = data.weather[0].icon;
                const locationName = data.name;
                const timezoneOffset = data.timezone;

                const iconData = iconMap[icon];
                if (weatherIcon) weatherIcon.className = `wi ${iconData.icon} ${iconData.color}`;
                if (weatherDescription) weatherDescription.textContent = weather;
                if (tempValue) tempValue.textContent = `${temp}°C`;
                if (locationDisplay) locationDisplay.textContent = locationName;
                currentTempCelsius = true;

                updateTime(timezoneOffset);
                updateAdditionalConditions(data);
                fetchAirQuality(lat, lon);
                fetchForecast(data.name);

                // Update the map marker 
                if (typeof L !== 'undefined' && map) {
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(`Weather: ${weather}<br>Temperature: ${temp}°C`)
                        .openPopup();
                }
            });
    };

    const fetchAirQuality = (lat, lon) => {
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${airQualityApiKey}`)
            .then(response => response.json())
            .then(data => {
                const aqi = data.list[0].main.aqi;
                const pm25 = data.list[0].components.pm2_5;
                const pm10 = data.list[0].components.pm10;

                aqiDisplay.textContent = aqi;
                pm25DataDisplay.textContent = pm25 + ' µg/m³';
                pm10DataDisplay.textContent = pm10 + ' µg/m³';
            });
    };

    const fetchAirQualityByRegion = (region) => {
        let lat, lon;
        switch(region) {
            case 'uk':
                lat = 54.0;
                lon = -2.0;
                break;
            case 'europe':
                lat = 50.0;
                lon = 10.0;
                break;
            case 'usa':
                lat = 37.0;
                lon = -95.0;
                break;
            default:
                lat = 54.0;
                lon = -2.0;
        }
        fetchAirQuality(lat, lon);
        if (region === 'uk') {
            ukTable.style.display = 'block';
            europeTable.style.display = 'none';
            usaTable.style.display = 'none';
        } else if (region === 'europe') {
            ukTable.style.display = 'none';
            europeTable.style.display = 'block';
            usaTable.style.display = 'none';
        } else if (region === 'usa') {
            ukTable.style.display = 'none';
            europeTable.style.display = 'none';
            usaTable.style.display = 'block';
        } else {
            ukTable.style.display = 'none';
            europeTable.style.display = 'none';
            usaTable.style.display = 'none';
        }
    };

    const fetchForecast = (city) => {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                forecastData.innerHTML = '';
                const labels = [];
                const temps = [];
                data.list.forEach(item => {
                    const forecastItem = document.createElement('div');
                    forecastItem.classList.add('forecast-item');
                    
                    const forecastDate = document.createElement('div');
                    forecastDate.classList.add('forecast-date');
                    forecastDate.textContent = item.dt_txt;

                    const forecastTemp = document.createElement('div');
                    forecastTemp.classList.add('forecast-temp');
                    forecastTemp.textContent = `${item.main.temp}°C`;

                    const forecastIcon = document.createElement('div');
                    forecastIcon.classList.add('forecast-icon');
                    const icon = document.createElement('i');
                    const iconData = iconMap[item.weather[0].icon];
                    icon.className = `wi ${iconData.icon} ${iconData.color}`;
                    forecastIcon.appendChild(icon);

                    forecastItem.appendChild(forecastDate);
                    forecastItem.appendChild(forecastTemp);
                    forecastItem.appendChild(forecastIcon);

                    forecastData.appendChild(forecastItem);

                    // Add data to chart
                    labels.push(item.dt_txt);
                    temps.push(item.main.temp);
                });

                renderForecastChart(labels, temps);
            });
    };

    const updateTime = (timezoneOffset) => {
        const localTime = new Date(new Date().getTime() + timezoneOffset * 1000);
        const timeString = localTime.toUTCString().replace(/ GMT$/, ""); 
        if (timeValue) timeValue.textContent = timeString;
    };

    const updateAdditionalConditions = (data) => {
        if (pressureDisplay) pressureDisplay.textContent = `${data.main.pressure} hPa`;
        if (visibilityDisplay) visibilityDisplay.textContent = `${data.visibility / 1000} km`;
        if (cloudCoverDisplay) cloudCoverDisplay.textContent = `${data.clouds.all} %`;
        if (humidityDisplay) humidityDisplay.textContent = `${data.main.humidity} %`;
    };

    const addFavoritePlace = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const newFavorite = {
            city: locationDisplay.textContent,
            description: weatherDescription.textContent,
            temp: tempValue.textContent,
            icon: weatherIcon.className
        };
        favorites.push(newFavorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Added to favorites');
    };

    const loadFavoritePlaces = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoritePlaces = document.getElementById('favorite-places');
        if (favoritePlaces) {
            favoritePlaces.innerHTML = '';

            favorites.forEach(fav => {
                const favItem = document.createElement('div');
                favItem.classList.add('favorite-item');
                favItem.innerHTML = `
                    <i class="${fav.icon}"></i>
                    <div>
                        <h2>${fav.city}</h2>
                        <p>${fav.description}</p>
                        <p>${fav.temp}</p>
                    </div>
                `;
                favoritePlaces.appendChild(favItem);
            });
        }
    };

    const clearFavorites = () => {
        localStorage.removeItem('favorites');
        loadFavoritePlaces();
    };

    if (searchCity) {
        searchCity.addEventListener('click', () => {
            const city = cityInput.value;
            fetchWeather(city);
            fetchForecast(city);
        });
    }

    if (toggleTemp) {
        toggleTemp.addEventListener('click', () => {
            const currentTemp = parseFloat(tempValue.textContent);
            if (currentTempCelsius) {
                tempValue.textContent = `${(currentTemp * 9/5) + 32}°F`;
                toggleTemp.textContent = 'Change to °C';
            } else {
                tempValue.textContent = `${(currentTemp - 32) * 5/9}°C`;
                toggleTemp.textContent = 'Change to °F';
            }
            currentTempCelsius = !currentTempCelsius;
        });
    }

    if (addToFavorites) {
        addToFavorites.addEventListener('click', addFavoritePlace);
    }

    if (clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener('click', clearFavorites);
    }

    const showPosition = (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
    };

    const showError = (error) => {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                locationDisplay.textContent = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                locationDisplay.textContent = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                locationDisplay.textContent = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                locationDisplay.textContent = "An unknown error occurred.";
                break;
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        if (locationDisplay) locationDisplay.textContent = "Geolocation is not supported by this browser.";
    }

    // Initialize the map 
    const mapElement = document.getElementById('map');
    let map;
    if (mapElement) {
        map = L.map('map').setView([51.505, -0.09], 13); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add event listener for map clicks
        map.on('click', (e) => {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            fetchWeatherByCoords(lat, lon);
        });
    }

    if (fetchAirQualityBtn) {
        fetchAirQualityBtn.addEventListener('click', () => {
            const region = regionSelect.value;
            fetchAirQualityByRegion(region);
        });
    }

    // Load favorite places 
    if (document.getElementById('favorite-places')) {
        loadFavoritePlaces();
    }

    // Render forecast chart
    const renderForecastChart = (labels, temps) => {
        const ctx = document.getElementById('temperature-chart').getContext('2d');
        if (forecastChart) {
            forecastChart.destroy();
        }
        forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature °C',
                    data: temps,
                    borderColor: '#43A7B9',
                    backgroundColor: 'rgba(67, 167, 185, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    }
                }
            }
        });
    };
});
