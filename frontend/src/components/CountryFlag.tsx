import { useState } from "react";

let cachedFlagEmojiSupport: boolean | null = null;

function supportsFlagEmoji(): boolean {
  if (cachedFlagEmojiSupport !== null) {
    return cachedFlagEmojiSupport;
  }

  if (typeof document === "undefined") {
    cachedFlagEmojiSupport = true;
    return true;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    cachedFlagEmojiSupport = false;
    return false;
  }

  ctx.textBaseline = "top";
  ctx.font = "16px sans-serif";
  ctx.fillText("🇵🇱", 0, 0);
  const pixels = ctx.getImageData(0, 0, 2, 2).data;
  cachedFlagEmojiSupport = pixels[0] !== 0 || pixels[1] !== 0 || pixels[2] !== 0;
  return cachedFlagEmojiSupport;
}

function toRegionalIndicators(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function toTwemojiUrl(countryCode: string): string {
  const points = countryCode
    .toUpperCase()
    .split("")
    .map((c) => (0x1f1e6 + c.charCodeAt(0) - 65).toString(16));

  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${points.join("-")}.png`;
}

interface CountryFlagProps {
  countryCode: string;
  size?: "sm" | "md";
}

export function CountryFlag({ countryCode, size = "sm" }: CountryFlagProps) {
  const [useEmoji] = useState(supportsFlagEmoji);
  const code = countryCode.trim();

  if (code.length !== 2) {
    return (
      <span className={size === "md" ? "text-3xl leading-none" : "text-xl leading-none"}>
        🌍
      </span>
    );
  }

  if (useEmoji) {
    return (
      <span
        className={
          size === "md"
            ? "text-3xl leading-none select-none"
            : "text-xl leading-none select-none"
        }
      >
        {toRegionalIndicators(code)}
      </span>
    );
  }

  return (
    <img
      src={toTwemojiUrl(code)}
      alt=""
      className={
        size === "md"
          ? "inline-block shrink-0 w-8 h-8 object-contain"
          : "inline-block shrink-0 w-5 h-5 object-contain"
      }
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
