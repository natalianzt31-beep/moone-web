"use client";

import { useState } from "react";

export function ProductImageCarousel({
  fotos,
  alt,
  fit = "contain",
}: {
  fotos: string[];
  alt: string;
  fit?: "contain" | "cover" | "cover-top" | "natural";
}) {
  const [index, setIndex] = useState(0);

  // El modo "natural" (grilla de vestidos/monos/tapados) no fuerza un
  // recuadro de tamaño fijo, así que sin fotos necesita su propia caja con
  // altura definida para no colapsar a 0px.
  if (fotos.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-crema ${
          fit === "natural" ? "aspect-[3/4] w-full" : "h-full w-full"
        }`}
      >
        <span className="text-xs uppercase tracking-wider text-taupe">Sin foto</span>
      </div>
    );
  }

  function next() {
    setIndex((i) => (i + 1) % fotos.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + fotos.length) % fotos.length);
  }

  return (
    <div className={`relative w-full ${fit === "natural" ? "" : "h-full"}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={next}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            next();
          }
        }}
        aria-label="Ver otra foto"
        className={`w-full cursor-pointer bg-blanco ${fit === "natural" ? "" : "h-full"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotos[index]}
          alt={alt}
          loading="lazy"
          className={
            fit === "natural"
              ? "block h-auto w-full"
              : fit === "cover-top"
                ? "h-full w-full object-cover object-top"
                : `h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`
          }
        />
      </div>

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Foto anterior"
            className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-blanco/80 text-lg leading-none text-negro shadow-sm transition-colors hover:bg-blanco"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Foto siguiente"
            className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-blanco/80 text-lg leading-none text-negro shadow-sm transition-colors hover:bg-blanco"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {fotos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? "bg-negro" : "bg-blanco/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
