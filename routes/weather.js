// routes/weather.js
const express = require("express");
const router = express.Router();
const request = require("request");

// Show the weather search form
router.get("/", function (req, res) {
  res.render("weather.ejs", {
    shopData: req.app.locals.shopData,
    error: null,
    message: null,
    weatherData: null,
  });
});

// Handle form submission and show weather for the chosen city
router.post("/", function (req, res, next) {
  const city = req.body.city;
  const apiKey = "82c34dc7df8771d5b0a94bb6548dc69d";

  if (!city) {
    return res.render("weather.ejs", {
      shopData: req.app.locals.shopData,
      error: "Please enter a city name.",
      message: null,
      weatherData: null,
    });
  }

  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  request(url, function (err, response, body) {
    if (err) {
      return next(err);
    }

    let weather;
    try {
      weather = JSON.parse(body);
    } catch (parseErr) {
      return res.render("weather.ejs", {
        shopData: req.app.locals.shopData,
        error: "Could not read weather data.",
        message: null,
        weatherData: null,
      });
    }

    // If city not found
    if (!weather || !weather.main) {
      return res.render("weather.ejs", {
        shopData: req.app.locals.shopData,
        error: "City not found. Try again.",
        message: null,
        weatherData: null,
      });
    }

    // Build an object with extra info
    const weatherData = {
      city: weather.name,
      temp: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      windSpeed: weather.wind ? weather.wind.speed : null,
      description:
        weather.weather && weather.weather[0]
          ? weather.weather[0].description
          : "",
    };

    res.render("weather.ejs", {
      shopData: req.app.locals.shopData,
      error: null,
      message: null, // not needed but kept for safety
      weatherData: weatherData,
    });
  });
});

// GET /weather/now
router.get("/now", function (req, res, next) {
  let apiKey = "82c34dc7df8771d5b0a94bb6548dc69d";
  let city = "london";

  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  request(url, function (err, response, body) {
    if (err) {
      return next(err); // network or request error
    }

    let weather;
    try {
      weather = JSON.parse(body);
    } catch (parseErr) {
      // JSON could not be parsed
      return res.send("No data found (could not read weather).");
    }

    if (weather !== undefined && weather.main !== undefined) {
      var wmsg =
        "It is " +
        weather.main.temp +
        " degrees in " +
        weather.name +
        ". The humidity now is: " +
        weather.main.humidity;

      res.send(wmsg);
    } else {
      // City not found or unexpected API response
      res.send("No data found");
    }
  });
});

// Export the router
module.exports = router;
