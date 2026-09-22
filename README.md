<div align="center">

# 🌦️ Precipitation Forecast

**A clearer picture of the weather ahead.**

Explore rain probability, temperature, and air quality in one interactive weather dashboard.

[![Live demo](https://img.shields.io/badge/Live_demo-Open_app-61c9e8?style=for-the-badge)](https://precipitation-web.onrender.com/)
![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql&logoColor=white)

[Preview](#preview) · [Features](#features) · [Known limitations](#known-limitations) · [Run locally](#run-locally) · [API](#api)

</div>

## Preview

### Weather at a glance

Current conditions, humidity, average precipitation probability, and forecast highlights against a weather-inspired background.

![Weather dashboard for Cosenza](assets/screenshots/weather.png)

### Explore the forecast

Switch between precipitation, temperature, and air quality. Hover, focus, or tap a forecast point to see its details.

![Precipitation forecast with peak labels and weather icons](assets/screenshots/forecast.png)

<details>
<summary>More screens: city search and sign in</summary>

### City search

![City search results for London](assets/screenshots/search.png)

### Sign in

![Sign-in screen](assets/screenshots/sign-in.png)

</details>

Screenshots show the deployed application; weather values change over time.

## Try it

**[Open the live application →](https://precipitation-web.onrender.com/)**

Search for a city and open its forecast. Weather browsing works without an account; register to save favorite cities and keep your search history.

The demo uses free hosting. After a period of inactivity, the API may need around a minute to wake up on the first request.

## Features

- **City search** with suggestions, country flags, and location details.
- **Weather overview** with current temperature, humidity, and precipitation highlights.
- **Interactive charts** for precipitation probability, temperature, and the OpenWeather air quality index.
- **Readable forecast labels** placed at selected peaks and turning points, with details available for every data point.
- **Weather-aware presentation** with condition icons, atmospheric backgrounds, and day/night variations.
- **Daily precipitation summary** based on available remaining forecast hours, falling back to the next available day.
- **Personal favorites and history** for registered users.
- **Responsive layout** with horizontally scrollable charts on smaller screens.

Forecast resolution depends on the OpenWeather plan: hourly forecasts require an eligible subscription; the free fallback uses three-hour forecast intervals. Chart times follow the viewer's device time zone.

## Built with

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, and custom CSS.
- **Charts:** custom SVG paths and interaction logic, without a charting library.
- **Backend:** Node.js, Express 5, TypeScript, Zod, and Prisma ORM.
- **Authentication:** Argon2 password hashing and JWT bearer tokens. The frontend stores the access token in localStorage.
- **Database:** PostgreSQL.
- **Tests:** Vitest, Supertest, and Testcontainers.
- **Live deployment:** Render for the frontend and API, Neon for PostgreSQL, and OpenWeather for weather data.

## Known limitations

The web application is live and its core flows are available. Mobile layout polish is still in progress.

- **Portrait mobile search:** the search field can become too narrow on phone screens. This is a known layout issue planned for a separate fix.
- **Cold starts:** the first API request after inactivity can be slow on the free hosting plan.
- **Forecast availability:** hourly data depends on the OpenWeather subscription; the free fallback uses three-hour intervals.

Found a problem? [Open an issue](https://github.com/Zzysa/precipitationForecast/issues) with steps to reproduce, expected and actual behavior, and your browser and screen size. Screenshots are welcome; omit passwords, tokens, and other private information.

## Run locally

### Requirements

- Node.js 22.12+ or Node.js 24 LTS.
- PostgreSQL, or Docker for the included local database.
- An OpenWeather API key.

### Backend

From the repository root:

```bash
cd backend
npm ci
```

Create `backend/.env` with your local settings:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/precipitation"
JWT_SECRET="replace-with-a-random-secret"
WEATHER_API_KEY="your-openweather-api-key"
FORECAST_MODE=3h
PORT=3000
```

Use `FORECAST_MODE=hourly` only if your API subscription supports hourly forecasts.

If using the included Docker database, start it from `backend`:

```bash
docker compose up -d
```

Apply existing migrations to your local database and start the API:

```bash
npm run db:deploy
npm run dev
```

The API runs at `http://localhost:3000`. Use your local database URL for development; a hosted database is not required.

### Frontend

In another terminal, from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the local backend. Leave `VITE_API_BASE_URL` unset for this setup; set it to a backend origin when building a frontend hosted separately.

### Checks

From `backend`:

```bash
npm run typecheck
npm run test:unit
npm run test:integration
```

Integration tests require Docker and use an isolated PostgreSQL container.

From `frontend`:

```bash
npm run lint
npm run build
```

## API

Public or optional-auth endpoints:

```text
GET  /api/health
GET  /api/city-search?city=London&country=GB
GET  /api/weather/:city
POST /api/auth/register
POST /api/auth/login
```

Endpoints requiring `Authorization: Bearer <token>`:

```text
GET    /api/auth/me
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:cityId
GET    /api/search-history
DELETE /api/search-history/:cityId
```

Signing out clears the token on the client. Authenticated weather requests also update the user's search history.

## Project structure

```text
frontend/src/
  pages/          Home, authentication, and city weather screens
  components/     City search, forecast charts, and weather icons
  api/            API client and response types
  context/        Authentication state
backend/
  src/            Routes, controllers, services, schemas, and mappers
  prisma/         Database schema and migrations
assets/screenshots/
                  Screenshots used in this README
```

## Credits

Weather, air quality, and geocoding data are provided by [OpenWeather](https://openweathermap.org/).

## License

ISC, as declared in the backend package metadata.
