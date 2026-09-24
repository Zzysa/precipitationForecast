import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { WeatherData } from "../api/weather";
import {
  smoothForecastPath,
  forecastLabelIndices,
  forecastTimeIndices,
} from "./forecastGeometry";
import { ForecastWeatherIcon } from "./ForecastWeatherIcon";
import { airLevels } from "./airQuality";
import "./HourlyForecastChart.css";

type Metric = "precipitation" | "temperature" | "air";
type Point = { timestamp: number; value: number };

const HOUR = 60 * 60 * 1000;
const WIDTH = 1000;
const HEIGHT = 246;
const TOP = 100;
const BOTTOM = 224;
const metrics: Record<Metric, { label: string; title: string }> = {
  precipitation: {
    label: "Precipitation",
    title: "Precipitation probability",
  },
  temperature: {
    label: "Temperature",
    title: "Temperature forecast",
  },
  air: {
    label: "Air quality",
    title: "Hourly air quality",
  },
};

function ForecastIcon({ metric }: { metric: Metric }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {metric === "precipitation" ? (
        <>
          <path d="M3 12a9 9 0 0 1 18 0c-1.5-1.4-3-1.4-4.5 0-1.5-1.4-3-1.4-4.5 0-1.5-1.4-3-1.4-4.5 0-1.5-1.4-3-1.4-4.5 0Z" />
          <path d="M12 3V2m0 10v7a2 2 0 0 0 4 0" />
        </>
      ) : metric === "temperature" ? (
        <>
          <path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z" />
          <path d="M12 8v9m6-11h2m-2 4h2" />
          <circle cx="12" cy="18" r="1.5" />
        </>
      ) : (
        <>
          <path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a2 2 0 1 1-2 2M4 16h6a3 3 0 1 1-3 3" />
        </>
      )}
    </svg>
  );
}

function valueLabel(value: number, metric: Metric) {
  if (metric === "air") return `${value} AQI`;
  return `${Math.round(value)}${metric === "temperature" ? "°C" : "%"}`;
}

function timeLabel(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateLabel(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getPoints(weather: WeatherData, metric: Metric, now: number): Point[] {
  const points =
    metric === "air"
      ? (weather.hourlyAirPollution ?? []).map((point) => ({
          timestamp: point.timestamp,
          value: point.aqi,
        }))
      : weather.hourlyForecast.map((point) => ({
          timestamp: point.timestamp,
          value:
            metric === "temperature"
              ? point.temp
              : point.precipitationProbability,
        }));
  return points
    .filter(
      ({ timestamp, value }) =>
        Number.isFinite(timestamp) &&
        Number.isFinite(value) &&
        timestamp * 1000 >= now &&
        timestamp * 1000 < now + 24 * HOUR &&
        (metric !== "air" ||
          (Number.isInteger(value) && value >= 1 && value <= 5)) &&
        (metric !== "precipitation" || (value >= 0 && value <= 100)),
    )
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (point, index, sorted) =>
        index === 0 || point.timestamp !== sorted[index - 1].timestamp,
    );
}

function ForecastPlot({
  points,
  metric,
  weather,
}: {
  points: Point[];
  metric: Metric;
  weather: WeatherData;
}) {
  const id = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredTimestamp, setHoveredTimestamp] = useState<number | null>(null);
  const [focusedTimestamp, setFocusedTimestamp] = useState<number | null>(null);
  const [viewport, setViewport] = useState({ width: 760, scrollLeft: 0 });
  const activeTimestamp = hoveredTimestamp ?? focusedTimestamp;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const measure = () =>
      setViewport({
        width: element.clientWidth,
        scrollLeft: element.scrollLeft,
      });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lower =
    metric === "temperature" ? Math.floor(min - 2) : metric === "air" ? 1 : 0;
  const upper =
    metric === "temperature" ? Math.ceil(max + 2) : metric === "air" ? 5 : 100;
  const first = points[0].timestamp;
  const last = points[points.length - 1].timestamp;
  const coordinates = points.map((point) => ({
    ...point,
    x:
      first === last
        ? WIDTH / 2
        : 54 + ((point.timestamp - first) / (last - first)) * (WIDTH - 108),
    y: BOTTOM - ((point.value - lower) / (upper - lower)) * (BOTTOM - TOP),
  }));
  const chartWidth = Math.max(760, viewport.width);
  const labels = forecastLabelIndices(coordinates, 135);
  const timeLabels = forecastTimeIndices(coordinates, 110);
  const selected = coordinates.find(
    (point) => point.timestamp === activeTimestamp,
  );
  const selectedWeather = weather.hourlyForecast.find(
    (point) => point.timestamp === selected?.timestamp,
  );
  const selectedAir = weather.hourlyAirPollution?.find(
    (point) => point.timestamp === selected?.timestamp,
  );
  const airLevel =
    selectedAir && Number.isInteger(selectedAir.aqi)
      ? airLevels[selectedAir.aqi - 1]
      : undefined;
  const tooltipWidth = Math.min(236, viewport.width - 16);
  const selectedLeft = selected
    ? (selected.x / WIDTH) * chartWidth - viewport.scrollLeft
    : 0;
  const tooltipLeft = Math.max(
    8,
    Math.min(
      viewport.width - tooltipWidth - 8,
      selectedLeft - tooltipWidth / 2,
    ),
  );
  const showTooltip =
    selected && selectedLeft >= 0 && selectedLeft <= viewport.width;
  const line = smoothForecastPath(coordinates);
  const area = `${line} L ${coordinates[coordinates.length - 1].x} ${HEIGHT} L ${coordinates[0].x} ${HEIGHT} Z`;
  const intervals = points
    .slice(1)
    .map((point, index) => point.timestamp - points[index].timestamp);
  const interval = intervals.length ? Math.min(...intervals) / 3600 : null;
  const cadence =
    interval === 1
      ? "Hourly forecast"
      : interval
        ? `Every ${interval} hours`
        : "One forecast available";
  return (
    <div>
      <div
        className="forecast-chart"
        onPointerLeave={() => setHoveredTimestamp(null)}
      >
        <div
          className="forecast-scroll"
          ref={scrollRef}
          role="region"
          aria-label={`${metrics[metric].title}, scroll horizontally on smaller screens`}
          tabIndex={0}
          onScroll={(event) =>
            setViewport({
              width: event.currentTarget.clientWidth,
              scrollLeft: event.currentTarget.scrollLeft,
            })
          }
        >
          <div className="forecast-plot">
            <svg
              className="forecast-drawing"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id={`${id}-colors`}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2={WIDTH}
                  y2="0"
                >
                  {coordinates.map((point) => (
                    <stop
                      key={point.timestamp}
                      offset={`${(point.x / WIDTH) * 100}%`}
                      stopColor={
                        metric === "air"
                          ? airLevels[point.value - 1].color
                          : "var(--forecast-color)"
                      }
                    />
                  ))}
                </linearGradient>
                <linearGradient
                  id={`${id}-fade`}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1={TOP}
                  x2="0"
                  y2={HEIGHT}
                >
                  <stop offset="0%" stopColor="white" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.025" />
                </linearGradient>
                <mask id={`${id}-mask`}>
                  <rect
                    width={WIDTH}
                    height={HEIGHT}
                    fill={`url(#${id}-fade)`}
                  />
                </mask>
              </defs>
              {[TOP, (TOP + BOTTOM) / 2, BOTTOM].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2={WIDTH}
                  y1={y}
                  y2={y}
                  className="forecast-grid-line"
                />
              ))}
              {points.length > 1 && (
                <path
                  d={area}
                  fill={`url(#${id}-colors)`}
                  mask={`url(#${id}-mask)`}
                />
              )}
              <path
                d={line}
                fill="none"
                stroke={`url(#${id}-colors)`}
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {coordinates.map((point, index) => {
              const active = point.timestamp === activeTimestamp;
              const labeled = labels.has(index);
              const air = metric === "air" ? airLevels[point.value - 1] : null;
              const forecast = weather.hourlyForecast.find(
                (item) => item.timestamp === point.timestamp,
              );
              const labelLeft =
                (point.x / WIDTH) * chartWidth - viewport.scrollLeft;
              const covered =
                showTooltip &&
                labelLeft + 40 > tooltipLeft &&
                labelLeft - 40 < tooltipLeft + tooltipWidth;
              return (
                <div
                  key={point.timestamp}
                  className={`forecast-annotation${labeled ? " has-label" : ""}${timeLabels.has(index) ? " has-time" : ""}${active ? " is-active" : ""}${covered ? " is-covered" : ""}`}
                  aria-hidden="true"
                  style={
                    {
                      left: `${(point.x / WIDTH) * 100}%`,
                      "--point-y": `${point.y}px`,
                      "--point-color": air?.color ?? "var(--forecast-color)",
                    } as CSSProperties
                  }
                >
                  <span className="forecast-point-guide" />
                  <span className="forecast-point-icon">
                    {metric === "precipitation" ? (
                      <ForecastWeatherIcon
                        code={forecast?.weatherIcon}
                        condition={forecast?.condition}
                        probability={point.value}
                      />
                    ) : (
                      <ForecastIcon metric={metric} />
                    )}
                  </span>
                  <span className="forecast-point-value">
                    {valueLabel(point.value, metric)}
                  </span>
                  {labeled && <span className="forecast-point-dot" />}
                  <span className="forecast-point-time">
                    <span>
                      {new Date(point.timestamp * 1000).toLocaleDateString(
                        "en",
                        { weekday: "short" },
                      )}
                    </span>
                    <strong>{timeLabel(point.timestamp)}</strong>
                  </span>
                </div>
              );
            })}
            {coordinates.map((point, index) => {
              const left =
                index === 0 ? 0 : (coordinates[index - 1].x + point.x) / 2;
              const right =
                index === coordinates.length - 1
                  ? WIDTH
                  : (point.x + coordinates[index + 1].x) / 2;
              return (
                <button
                  type="button"
                  className="forecast-hit-target"
                  key={point.timestamp}
                  style={{
                    left: `${(left / WIDTH) * 100}%`,
                    width: `${((right - left) / WIDTH) * 100}%`,
                  }}
                  aria-label={`${dateLabel(point.timestamp)}, ${timeLabel(point.timestamp)}: ${valueLabel(point.value, metric)}`}
                  aria-describedby={
                    showTooltip && point.timestamp === activeTimestamp
                      ? `${id}-tooltip`
                      : undefined
                  }
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "touch")
                      setHoveredTimestamp(point.timestamp);
                  }}
                  onFocus={() => {
                    setFocusedTimestamp(point.timestamp);
                    setHoveredTimestamp(null);
                  }}
                  onBlur={() => setFocusedTimestamp(null)}
                  onClick={() => {
                    setFocusedTimestamp(point.timestamp);
                    setHoveredTimestamp(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setFocusedTimestamp(null);
                      setHoveredTimestamp(null);
                      return;
                    }
                    const offset =
                      event.key === "ArrowRight"
                        ? 1
                        : event.key === "ArrowLeft"
                          ? -1
                          : 0;
                    if (!offset) return;
                    event.preventDefault();
                    const sibling =
                      offset === 1
                        ? event.currentTarget.nextElementSibling
                        : event.currentTarget.previousElementSibling;
                    if (sibling instanceof HTMLButtonElement) sibling.focus();
                  }}
                />
              );
            })}
          </div>
        </div>
        {showTooltip && (
          <div
            id={`${id}-tooltip`}
            className="forecast-tooltip"
            role="tooltip"
            style={{
              left: tooltipLeft,
              top: Math.max(8, selected.y - 168),
              width: tooltipWidth,
            }}
          >
            <div className="forecast-tooltip-heading">
              <strong>{timeLabel(selected.timestamp)}</strong>
              <span>{dateLabel(selected.timestamp)}</span>
            </div>
            <p>{selectedWeather?.condition ?? "Forecast details"}</p>
            <dl>
              <div>
                <dt>
                  <ForecastIcon metric="precipitation" />
                  Precipitation
                </dt>
                <dd>
                  {selectedWeather &&
                  Number.isFinite(selectedWeather.precipitationProbability)
                    ? valueLabel(
                        selectedWeather.precipitationProbability,
                        "precipitation",
                      )
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>
                  <ForecastIcon metric="temperature" />
                  Temperature
                </dt>
                <dd>
                  {selectedWeather && Number.isFinite(selectedWeather.temp)
                    ? valueLabel(selectedWeather.temp, "temperature")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>
                  <ForecastIcon metric="air" />
                  Air quality
                </dt>
                <dd style={{ color: airLevel?.color }}>
                  {airLevel && selectedAir
                    ? `${selectedAir.aqi} · ${airLevel.label}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
      <div className="forecast-footnote">
        <span>{cadence} · Times in your device’s time zone</span>
        <span>Hover or tap any hour for details</span>
      </div>
    </div>
  );
}

export function HourlyForecastChart({
  weather,
  now,
}: {
  weather: WeatherData;
  now: number;
}) {
  const [metric, setMetric] = useState<Metric>("precipitation");
  const id = useId();
  const points = getPoints(weather, metric, now);

  return (
    <section
      className={`hourly-forecast forecast-${metric}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="forecast-heading">
        <div>
          <p className="forecast-eyebrow">NEXT 24 HOURS</p>
          <h2 id={`${id}-title`}>{metrics[metric].title}</h2>
        </div>
      </div>
      <div className="forecast-toolbar">
        <div
          className="forecast-switch"
          role="group"
          aria-label="Forecast metric"
        >
          {(Object.keys(metrics) as Metric[]).map((option) => (
            <button
              type="button"
              key={option}
              aria-label={metrics[option].label}
              title={metrics[option].label}
              aria-pressed={metric === option}
              aria-controls={`${id}-chart`}
              onClick={() => setMetric(option)}
            >
              <ForecastIcon metric={option} />
            </button>
          ))}
        </div>
      </div>
      <div id={`${id}-chart`}>
        {points.length ? (
          <ForecastPlot
            key={metric}
            points={points}
            metric={metric}
            weather={weather}
          />
        ) : (
          <div className="forecast-empty" role="status">
            <ForecastIcon metric={metric} />
            <h3>{metrics[metric].label} forecast unavailable</h3>
            <p>
              No data for the next 24 hours. Check back after the next update.
            </p>
          </div>
        )}
      </div>
      {metric === "air" && (
        <div
          className="forecast-air-legend"
          aria-label="OpenWeather air quality index, 1 is best and 5 is worst"
        >
          <span>Air quality index</span>
          {airLevels.map((level, index) => (
            <span key={level.label}>
              <i style={{ backgroundColor: level.color }} />
              {index + 1} · {level.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
