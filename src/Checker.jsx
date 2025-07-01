import React, { useState, useEffect } from "react";
import "./Checker.css";

const Checker = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const apiKey = import.meta.env.VITE_APP_ID;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();

      if (response.status !== 200) {
        setError(data.message || "City not found");
        setWeather(null);
        setLoading(false);
        return;
      }

      setWeather({
        location: data.name,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      });
    } catch {
      setError("Failed to fetch weather data");
      setWeather(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWeather("Dhaka");
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchWeather(city);
  };

  const handleChange = async (e) => {
    const input = e.target.value;
    setCity(input);

    if (input.length >= 2) {
      try {
        const apiKey = import.meta.env.VITE_APP_ID;
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=10&appid=${apiKey}`
        );
        const data = await res.json();

        const filtered = data.filter((item) =>
          item.name.toLowerCase().startsWith(input.toLowerCase())
        );

        const uniqueSuggestions = [];
        const seen = new Set();

        for (const item of filtered) {
          const key = `${item.name},${item.country}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSuggestions.push({
              name: item.name,
              country: item.country,
            });
          }
        }

        setSuggestions(uniqueSuggestions);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <main className="checker-wrapper">
      <h1 className="title">Weather Checker</h1>
      <section className="search-section">
        <div className="input-wrapper">
          <input
            className="search-input"
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="City name"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    const fullCity = `${suggestion.name}, ${suggestion.country}`;
                    setCity(fullCity);
                    setSuggestions([]);
                    fetchWeather(suggestion.name);
                  }}
                >
                  {suggestion.name}, {suggestion.country}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="search-btn" onClick={() => fetchWeather(city)}>
          Search
        </button>
      </section>

      {loading && <p className="info-text">Loading weather data...</p>}
      {error && <p className="error-text">{error}</p>}
      {weather && !loading && !error && (
        <section className="weather-card" aria-live="polite">
          <h2 className="location">{weather.location}</h2>
          <img
            className="weather-icon"
            src={weather.iconUrl}
            alt={weather.description}
            width="100"
            height="100"
          />
          <p className="temperature">{weather.temperature}°C</p>
          <p className="description">{weather.description}</p>
          <div className="extra-info">
            <div>
              <strong>Humidity:</strong> {weather.humidity}%
            </div>
            <div>
              <strong>Wind:</strong> {weather.windSpeed} m/s
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Checker;
