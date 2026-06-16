import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

function LogoMark({ width, strokeWidth }: { width: number; strokeWidth: number }) {
  const height = Math.round(width * 0.5333);

  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 120 64"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="34" cy="32" r="14" stroke="#1598C1" strokeWidth={strokeWidth} />
      <circle cx="86" cy="32" r="14" stroke="#1598C1" strokeWidth={strokeWidth} />
      <path
        d="M46 32H74"
        stroke="#1598C1"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(10,115,148,1) 0%, rgba(7,74,96,1) 100%)",
          borderRadius: 112,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#FFD31A",
            borderRadius: 999,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.22)",
            display: "flex",
            height: 180,
            justifyContent: "center",
            width: 280,
          }}
        >
          <LogoMark strokeWidth={12} width={148} />
        </div>
      </div>
    ),
    size,
  );
}
