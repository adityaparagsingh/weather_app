// Elements

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const weatherContent =
    document.getElementById("weatherContent");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");


// ========================================
// START APP
// ========================================

window.addEventListener("DOMContentLoaded", () => {

    cityInput.value = "Pune";

    searchCity("Pune");

});


// ========================================
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener("click", () => {

    const city =
        cityInput.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;

    }

    searchCity(city);

});


// ========================================
// ENTER KEY
// ========================================

cityInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            searchBtn.click();

        }

    }
);


// ========================================
// SEARCH CITY
// ========================================

async function searchCity(city) {

    showLoading();

    hideError();


    try {

        // Get latitude and longitude
        // from city name

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(city)}` +
            `&count=1` +
            `&language=en` +
            `&format=json`;


        const geoResponse =
            await fetch(geoURL);


        if (!geoResponse.ok) {

            throw new Error(
                "Unable to find the city."
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "City not found. Check the spelling."
            );

        }


        const location =
            geoData.results[0];


        getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country,
            location.timezone
        );

    }

    catch (error) {

        hideLoading();

        showError(
            error.message
        );

    }

}


// ========================================
// GET WEATHER
// ========================================

async function getWeather(
    latitude,
    longitude,
    name,
    country,
    timezone
) {

    try {

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m` +
            `&hourly=visibility` +
            `&daily=sunrise,sunset` +
            `&timezone=auto`;


        const response =
            await fetch(weatherURL);


        if (!response.ok) {

            throw new Error(
                "Unable to get weather data."
            );

        }


        const data =
            await response.json();


        displayWeather(
            data,
            name,
            country,
            timezone
        );

    }

    catch (error) {

        showError(
            error.message
        );

    }

    finally {

        hideLoading();

    }

}


// ========================================
// DISPLAY WEATHER
// ========================================

function displayWeather(
    data,
    name,
    country,
    timezone
) {

    const current =
        data.current;


    // Location

    document.getElementById(
        "cityName"
    ).textContent = name;


    document.getElementById(
        "countryName"
    ).textContent = country;


    // Temperature

    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(
            current.temperature_2m
        );


    // Feels like

    document.getElementById(
        "feelsLike"
    ).textContent =
        Math.round(
            current.apparent_temperature
        );


    // Condition

    document.getElementById(
        "condition"
    ).textContent =
        getWeatherDescription(
            current.weather_code
        );


    // Weather Icon

    document.getElementById(
        "weatherIcon"
    ).textContent =
        getWeatherIcon(
            current.weather_code,
            current.is_day
        );


    // Humidity

    document.getElementById(
        "humidity"
    ).textContent =
        current.relative_humidity_2m;


    // Wind

    document.getElementById(
        "windSpeed"
    ).textContent =
        Math.round(
            current.wind_speed_10m
        );


    // Pressure

    document.getElementById(
        "pressure"
    ).textContent =
        Math.round(
            current.surface_pressure
        );


    // Cloud Cover

    document.getElementById(
        "cloudiness"
    ).textContent =
        current.cloud_cover;


    // Wind Direction

    document.getElementById(
        "windDirection"
    ).textContent =
        getWindDirection(
            current.wind_direction_10m
        );


    // Visibility

    const visibility =
        getCurrentVisibility(
            data
        );


    document.getElementById(
        "visibility"
    ).textContent =
        visibility;


    // Sunrise

    document.getElementById(
        "sunrise"
    ).textContent =
        formatTime(
            data.daily.sunrise[0]
        );


    // Sunset

    document.getElementById(
        "sunset"
    ).textContent =
        formatTime(
            data.daily.sunset[0]
        );


    // Date and Time

    updateDateTime(
        timezone
    );

}


// ========================================
// WEATHER DESCRIPTIONS
// ========================================

function getWeatherDescription(code) {

    const weatherCodes = {

        0: "Clear Sky",

        1: "Mainly Clear",

        2: "Partly Cloudy",

        3: "Overcast",

        45: "Fog",

        48: "Depositing Rime Fog",

        51: "Light Drizzle",

        53: "Moderate Drizzle",

        55: "Dense Drizzle",

        56: "Light Freezing Drizzle",

        57: "Dense Freezing Drizzle",

        61: "Slight Rain",

        63: "Moderate Rain",

        65: "Heavy Rain",

        66: "Light Freezing Rain",

        67: "Heavy Freezing Rain",

        71: "Slight Snow",

        73: "Moderate Snow",

        75: "Heavy Snow",

        77: "Snow Grains",

        80: "Slight Rain Showers",

        81: "Moderate Rain Showers",

        82: "Violent Rain Showers",

        85: "Slight Snow Showers",

        86: "Heavy Snow Showers",

        95: "Thunderstorm",

        96: "Thunderstorm With Hail",

        99: "Thunderstorm With Heavy Hail"

    };


    return (
        weatherCodes[code] ||
        "Unknown Weather"
    );

}


// ========================================
// WEATHER ICON
// ========================================

function getWeatherIcon(
    code,
    isDay
) {

    if (code === 0) {

        return isDay ? "☀️" : "🌙";

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return isDay ? "🌤️" : "🌙";

    }


    if (code === 3) {

        return "☁️";

    }


    if (
        code === 45 ||
        code === 48
    ) {

        return "🌫️";

    }


    if (
        code >= 51 &&
        code <= 67
    ) {

        return "🌧️";

    }


    if (
        code >= 71 &&
        code <= 86
    ) {

        return "❄️";

    }


    if (
        code >= 95
    ) {

        return "⛈️";

    }


    return "🌤️";

}


// ========================================
// WIND DIRECTION
// ========================================

function getWindDirection(degrees) {

    const directions = [

        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW"

    ];


    const index =
        Math.round(
            degrees / 22.5
        ) % 16;


    return directions[index];

}


// ========================================
// VISIBILITY
// ========================================

function getCurrentVisibility(data) {

    if (
        !data.hourly ||
        !data.hourly.visibility
    ) {

        return "--";

    }


    const currentTime =
        data.current.time;


    const index =
        data.hourly.time.indexOf(
            currentTime
        );


    if (index === -1) {

        return "--";

    }


    return (
        data.hourly.visibility[index] /
        1000
    ).toFixed(1);

}


// ========================================
// TIME FORMAT
// ========================================

function formatTime(timeString) {

    const date =
        new Date(timeString);


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ========================================
// LOCAL DATE / TIME
// ========================================

function updateDateTime(timezone) {

    const now =
        new Date();


    try {

        const date =
            now.toLocaleDateString(
                "en-US",
                {
                    timeZone: timezone,
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        const time =
            now.toLocaleTimeString(
                "en-US",
                {
                    timeZone: timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                }
            );


        document.getElementById(
            "date"
        ).textContent = date;


        document.getElementById(
            "time"
        ).textContent = time;

    }

    catch {

        document.getElementById(
            "date"
        ).textContent =
            now.toLocaleDateString();


        document.getElementById(
            "time"
        ).textContent =
            now.toLocaleTimeString();

    }

}


// ========================================
// MY LOCATION
// ========================================

locationBtn.addEventListener(
    "click",
    () => {

        hideError();


        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        showLoading();


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    // Reverse geocoding

                    const geoURL =
                        `https://geocoding-api.open-meteo.com/v1/search` +
                        `?name=Pune&count=1&language=en&format=json`;


                    // Direct weather request

                    const weatherURL =
                        `https://api.open-meteo.com/v1/forecast` +
                        `?latitude=${latitude}` +
                        `&longitude=${longitude}` +
                        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m` +
                        `&hourly=visibility` +
                        `&daily=sunrise,sunset` +
                        `&timezone=auto`;


                    const response =
                        await fetch(weatherURL);


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            "Unable to get your weather."
                        );

                    }


                    // Try to get location name

                    let locationName =
                        "Your Location";

                    let countryName =
                        "";


                    try {

                        const reverseURL =
                            `https://geocoding-api.open-meteo.com/v1/search` +
                            `?name=${latitude},${longitude}` +
                            `&count=1&language=en&format=json`;


                        const geoResponse =
                            await fetch(reverseURL);


                        const geoData =
                            await geoResponse.json();


                        if (
                            geoData.results &&
                            geoData.results.length
                        ) {

                            locationName =
                                geoData.results[0].name;

                            countryName =
                                geoData.results[0].country;

                        }

                    }

                    catch {

                        // Keep default location name

                    }


                    displayWeather(
                        data,
                        locationName,
                        countryName,
                        data.timezone
                    );


                    cityInput.value =
                        locationName;

                }

                catch (error) {

                    showError(
                        error.message
                    );

                }

                finally {

                    hideLoading();

                }

            },


            () => {

                hideLoading();

                showError(
                    "Location permission was denied or unavailable."
                );

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }

        );

    }
);


// ========================================
// ERROR
// ========================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorBox.classList.add("show");

}


function hideError() {

    errorBox.classList.remove("show");

}


// ========================================
// LOADING
// ========================================

function showLoading() {

    loading.classList.add("show");

    weatherContent.style.display =
        "none";

}


function hideLoading() {

    loading.classList.remove("show");

    weatherContent.style.display =
        "block";

}