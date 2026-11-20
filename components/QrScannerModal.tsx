"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

/**
 * Escanea un QR con la cámara del dispositivo y devuelve el texto crudo
 * decodificado (el llamador decide cómo interpretarlo — acá se usa para
 * sacar el SKU de las etiquetas, que codifican la URL de la ficha pública
 * del producto, ej. https://moone.com.uy/p/VES-00333).
 */
export function QrScannerModal({
  onScan,
  onClose,
}: {
  onScan: (textoDecodificado: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelada = false;

    function escanear() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        frameRef.current = requestAnimationFrame(escanear);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const codigo = jsQR(imageData.data, imageData.width, imageData.height);
      if (codigo?.data) {
        onScan(codigo.data);
        return;
      }
      frameRef.current = requestAnimationFrame(escanear);
    }

    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelada) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        escanear();
      } catch {
        if (!cancelada) {
          setError("No pudimos acceder a la cámara. Revisá los permisos del navegador.");
        }
      }
    }

    iniciar();

    return () => {
      cancelada = true;
      cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/80 px-4">
      <div className="w-full max-w-sm rounded-[3px] bg-blanco p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-wider text-negro">Escanear QR</p>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center text-taupe hover:text-negro"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 overflow-hidden rounded-[3px] bg-negro">
          <video ref={videoRef} playsInline muted className="aspect-square w-full object-cover" />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        {error ? (
          <p className="mt-3 text-sm text-chocolate">{error}</p>
        ) : (
          <p className="mt-3 text-xs text-taupe">Apuntá la cámara al código QR de la etiqueta.</p>
        )}
      </div>
    </div>
  );
}
