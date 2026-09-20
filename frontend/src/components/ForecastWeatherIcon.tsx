export function ForecastWeatherIcon({
  code,
  condition,
  probability,
}: {
  code?: string;
  condition?: string;
  probability?: number;
}) {
  const conditionKind =
    code?.slice(0, 2) ??
    (/clear/i.test(condition ?? "")
      ? "01"
      : /cloud/i.test(condition ?? "")
        ? "03"
        : /rain|drizzle/i.test(condition ?? "")
          ? "10"
          : /snow/i.test(condition ?? "")
            ? "13"
            : /thunder/i.test(condition ?? "")
              ? "11"
              : /mist|fog|haze/i.test(condition ?? "")
                ? "50"
                : "unknown");
  const kind =
    probability !== undefined && Number.isFinite(probability)
      ? probability === 0
        ? "01"
        : probability <= 20
          ? "02"
          : probability < 50
            ? "03"
            : probability < 80
              ? "10"
              : "umbrella"
      : conditionKind;
  const night = code?.endsWith("n");
  const sun = kind === "01" || kind === "02";
  const cloud = ["02", "03", "04", "09", "10", "11", "13"].includes(kind);
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {sun && (
        <g
          color={night ? "#d4e4ff" : "#f5d78c"}
          transform={kind === "02" ? "translate(-1 -2) scale(.8)" : undefined}
        >
          {night ? (
            <path d="M22 21A10 10 0 0 1 12 5a10.5 10.5 0 1 0 15 14 10 10 0 0 1-5 2Z" />
          ) : (
            <>
              <circle
                cx="16"
                cy="16"
                r="6"
                fill="currentColor"
                fillOpacity=".18"
              />
              <path d="M16 3v3m0 20v3M3 16h3m20 0h3M7 7l2 2m14 14 2 2M7 25l2-2M23 9l2-2" />
            </>
          )}
        </g>
      )}
      {cloud && (
        <path
          d="M9 23a5 5 0 1 1 0-10 7 7 0 0 1 13-2 6 6 0 1 1 2 12Z"
          fill="#294552"
          fillOpacity=".8"
        />
      )}
      {["09", "10"].includes(kind) && (
        <path d="m11 26-1 3m7-3-1 3m7-3-1 3" color="#94d6f2" />
      )}
      {kind === "11" && <path d="m17 21-3 5h4l-3 5" color="#f5d78c" />}
      {kind === "13" && <path d="M12 26v4m-2-2h4m7-2v4m-2-2h4" />}
      {kind === "50" && <path d="M6 10h20M3 16h26M7 22h18" />}
      {(kind === "unknown" || kind === "umbrella") && (
        <>
          <path d="M4 16a12 12 0 0 1 24 0H4Zm12 0v10a3 3 0 0 0 6 0" />
        </>
      )}
    </svg>
  );
}
