class WeatherApp {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    this.init();
  }

  init() {
    document.getElementById('searchBtn').addEventListener('click', () => this.searchWeather());
    this.renderHistory();
    document.getElementById('historyList').addEventListener('click', (e) => {
      if (e.target.classList.contains('history-item')) {
        this.fetchWeather(e.target.textContent);
      }
    });
    this.map = L.map('map').setView([-2.5, 117], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.marker = null;
  }

  async searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
      await this.fetchWeather(city);
    }
  }

  async fetchWeather(city) {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=id`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric&lang=id`)
      ]);
      if (!currentRes.ok) throw new Error('Kota tidak ditemukan.');
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();
      this.renderWeather(currentData);
      this.renderForecast(forecastData);
      this.addToHistory(city);
      this.updateMap(currentData.coord.lat, currentData.coord.lon);
    } catch (error) {
      document.getElementById('weatherInfo').innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
  }

  renderWeather(data) {
    const html = `
      <h3>${data.name}, ${data.sys.country}</h3>
      <p>🌡️ Suhu: ${data.main.temp} °C</p>
      <p>🌥️ Cuaca: ${data.weather[0].description}</p>
    `;
    document.getElementById('weatherInfo').innerHTML = html;
  }

  renderForecast(data) {
    const list = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
    const emojiMap = {
      "clear": "☀️",
      "clouds": "☁️",
      "rain": "🌧️",
      "thunderstorm": "⛈️",
      "snow": "❄️",
      "mist": "🌫️"
    };

    const html = '<h4>📅 Prakiraan 5 Hari ke Depan</h4>' + list.map(item => {
      const weatherMain = item.weather[0].main.toLowerCase();
      const emoji = emojiMap[weatherMain] || "🌡️";
      const date = new Date(item.dt_txt);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
      return `
        <div>
          <span>${emoji} <strong>${dayName}</strong></span>
          <span>${item.main.temp.toFixed(1)}°C - ${item.weather[0].description}</span>
        </div>
      `;
    }).join('');
    document.getElementById('forecast').innerHTML = html;
  }

  addToHistory(city) {
    if (!this.history.includes(city)) {
      this.history.unshift(city);
      if (this.history.length > 10) this.history.pop();
      localStorage.setItem('weatherHistory', JSON.stringify(this.history));
      this.renderHistory();
    }
  }

  renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    this.history.forEach(city => {
      const li = document.createElement('li');
      li.textContent = city;
      li.classList.add('history-item');
      historyList.appendChild(li);
    });
  }

  updateMap(lat, lon) {
    this.map.setView([lat, lon], 10);
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker([lat, lon]).addTo(this.map);
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function showSection(section) {
  document.getElementById('homeSection').style.display = section === 'home' ? 'block' : 'none';
  document.getElementById('historySection').style.display = section === 'history' ? 'block' : 'none';
  document.getElementById('aboutSection').style.display = section === 'about' ? 'block' : 'none';
}


const API_KEY = 'b04da9f505a4b8a4602ff679431c172a';
const app = new WeatherApp(API_KEY);
