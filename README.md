# 🌧️ Precipitation Forecast

A modern full-stack web application for tracking weather conditions and precipitation probability. Built with a robust TypeScript backend and an interactive React dashboard.

## 🎨 Target UI Concept (In Progress)

> **Note:** The backend architecture and API endpoints are fully implemented and covered with integration tests. The frontend dashboard is currently under active development based on the design concept below.

<p align="center">
  <img src="./assets/ui-concept.jpg" alt="Precipitation Forecast Dashboard Concept" width="800"/>
</p>

---

## 🚀 Tech Stack

- **Backend**: Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL, Zod, Argon2, Jose (JWT).
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Recharts.
- **Testing**: Vitest, Supertest, Testcontainers (PostgreSQL integration tests).
- **External API**: OpenWeather API (Weather, Forecast, Geocoding, Air Pollution).

---

## 📌 Features

### ✅ Completed
- **Authentication**: User registration and login with secure HTTP-only cookies, JWT verification, and Argon2 password hashing.
- **City Search**: Debounced city autocomplete with country flags, instant favorites toggle, and history management.
- **Favorites & History**: Save favorite cities and automatically track recent searches per user.
- **Weather & Precipitation API**: Aggregated endpoints for current weather, hourly precipitation probability, and air quality index (AQI).
- **Automated Testing**: 120+ unit tests and full-suite integration tests with isolated PostgreSQL containers.

### 🚧 In Progress / Planned
- **Dashboard Redesign**: Glassmorphic UI matching the target concept design.
- **Interactive Precipitation Chart**: Smooth 24-hour rain probability curve with time markers and condition icons.
- **Live Weather Widgets**: Detailed cards for average precipitation, humidity, and peak rain chance.
- **Localization**: Multi-language support and unit switching (°C / °F).

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive session cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/auth/me` | Get current user profile | Yes |

### City Search
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/city-search?city={name}&country={code}` | Search cities with OpenWeather & user data | Optional |

### Weather
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/weather/:city` | Current weather, 24h forecast, AQI | Optional |

### Favorites
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/favorites` | Get user's favorite cities | Yes |
| `POST` | `/api/favorites` | Add city to favorites | Yes |
| `DELETE` | `/api/favorites/:cityId` | Remove city from favorites | Yes |

### Search History
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/search-history` | Get user's search history | Yes |
| `DELETE` | `/api/search-history/:cityId` | Remove city from search history | Yes |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20 or newer)
- PostgreSQL (local instance or Docker container)
- OpenWeather API Key ([Get one here](https://openweathermap.org/api))

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `backend/`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/precipitation"
   JWT_SECRET="your-secure-secret"
   WEATHER_API_KEY="your-openweather-api-key"
   ```

4. Run Prisma database migrations and seed demo data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   > Default demo account: `demo` / `demo-password-123`

5. Start backend development server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

6. Run tests:
   ```bash
   npm test
   ```

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start frontend development server:
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:5173` (requests to `/api` are automatically proxied to port 3000).

---

## 📄 License

ISC License.
