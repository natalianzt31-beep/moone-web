import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "Môone — Alquiler de vestidos de fiesta en Montevideo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [cormorantGaramond, logoBuffer] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/CormorantGaramond-Medium.ttf")),
  readFile(join(process.cwd(), "assets/logo-isotipo.png")),
]);
const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={186} height={260} alt="" />
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 96,
            color: "#171513",
          }}
        >
          MÔONE
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
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
