import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Sanish Chirayath").slice(0, 140);
  const subtitle = searchParams.get("subtitle") ?? "portfolio.hstart.in";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#0f1114",
        color: "#f2f3f5",
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 22,
          color: "#8f96a3",
        }}
      >
        <span style={{ color: "#4ade80" }}>●</span>
        <span>sanish.chirayath</span>
        <span>·</span>
        <span>{subtitle}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 64,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          fontWeight: 500,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          color: "#8f96a3",
        }}
      >
        <span>Bangalore, IN</span>
        <span>github.com/sanishchirayath1</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
