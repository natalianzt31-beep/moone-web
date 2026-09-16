import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "Môone — Alquiler de vestidos de fiesta en Montevideo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cormorantGaramond = await readFile(
  join(process.cwd(), "assets/fonts/CormorantGaramond-Medium.ttf")
);

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F5EF",
          fontFamily: "Cormorant Garamond",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 160,
            color: "#171513",
          }}
        >
          Môone
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 36,
            color: "#171513",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorantGaramond,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
