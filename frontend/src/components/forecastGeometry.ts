export interface ChartCoordinate {
  x: number;
  y: number;
}

export function smoothForecastPath(points: ChartCoordinate[]): string {
  if (!points.length) return "";
  const slopes = points
    .slice(1)
    .map(
      (point, index) =>
        (point.y - points[index].y) / (point.x - points[index].x),
    );
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0] ?? 0;
    if (index === points.length - 1) return slopes[index - 1];
    const before = slopes[index - 1];
    const after = slopes[index];
    if (before * after <= 0) return 0;
    const previousWidth = points[index].x - points[index - 1].x;
    const nextWidth = points[index + 1].x - points[index].x;
    const firstWeight = 2 * nextWidth + previousWidth;
    const secondWeight = nextWidth + 2 * previousWidth;
    return (
      (firstWeight + secondWeight) /
      (firstWeight / before + secondWeight / after)
    );
  });
  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = points[index - 1];
      const third = (point.x - previous.x) / 3;
      return `C ${previous.x + third} ${previous.y + tangents[index - 1] * third}, ${point.x - third} ${point.y - tangents[index] * third}, ${point.x} ${point.y}`;
    })
    .join(" ");
}

export function forecastTimeIndices(
  points: ChartCoordinate[],
  spacing: number,
): Set<number> {
  if (!points.length) return new Set();
  const indices = [0];
  for (let index = 1; index < points.length; index++) {
    if (points[index].x - points[indices[indices.length - 1]].x >= spacing)
      indices.push(index);
  }
  return new Set(indices);
}

export function forecastLabelIndices(
  points: ChartCoordinate[],
  spacing: number,
): Set<number> {
  if (!points.length) return new Set();
  const candidates: { index: number; score: number }[] = [];
  const ys = points.map((point) => point.y);
  const range = Math.max(...ys) - Math.min(...ys);
  for (let start = 0; start < points.length;) {
    let end = start;
    while (
      end + 1 < points.length &&
      Math.abs(points[end + 1].y - points[start].y) < 0.001
    )
      end++;
    const y = points[start].y;
    const previous = points[start - 1]?.y;
    const next = points[end + 1]?.y;
    if (previous !== undefined && next !== undefined) {
      const peak = y < previous && y < next;
      const valley = y > previous && y > next;
      const prominence = Math.min(Math.abs(y - previous), Math.abs(y - next));
      if (peak || valley)
        candidates.push({
          index: Math.floor((start + end) / 2),
          score: peak
            ? range + Math.max(...ys) - y + prominence
            : range * 0.4 + prominence,
        });
    }
    start = end + 1;
  }
  candidates.push(
    { index: 0, score: range * 0.25 },
    { index: points.length - 1, score: range * 0.25 },
  );
  const indices: number[] = [];
  for (const { index } of candidates.sort(
    (a, b) => b.score - a.score || a.index - b.index,
  )) {
    if (
      indices.every(
        (selected) => Math.abs(points[selected].x - points[index].x) >= spacing,
      )
    )
      indices.push(index);
    if (indices.length === 6) break;
  }
  return new Set(indices);
}
