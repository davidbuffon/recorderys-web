import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
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

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(10,115,148,1) 0%, rgba(7,74,96,1) 100%)",
          borderRadius: 40,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#FFD31A",
            borderRadius: 999,
            display: "flex",
            height: 66,
            justifyContent: "center",
            width: 104,
          }}
        >
          <LogoMark strokeWidth={11} width={62} />
        </div>
      </div>
    ),
    size,
  );
}
