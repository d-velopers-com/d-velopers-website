import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(135deg, ${siteConfig.themeColor} 0%, #0369A1 100%)`,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            marginBottom: 20,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            textAlign: "center",
            opacity: 0.95,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

