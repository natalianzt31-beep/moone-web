import { Nav } from "@/components/Nav";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

const PREGUNTAS = [
  {
    pregunta: "¿Cómo alquilo una prenda?",
    respuesta:
      "Elegís la pieza en Colección y tocás \"Reservar\". Coordinamos por WhatsApp la fecha de retiro, el talle y el pago de la seña para dejarla apartada.",
  },
  {
    pregunta: "¿Cuánto tengo que pagar para reservar?",
    respuesta:
      "El alquiler se reserva con una seña del 50% del precio. El otro 50% se abona al retirar la prenda en el local.",
  },
  {
    pregunta: "¿Por cuántos días es el alquiler?",
    respuesta:
      "El alquiler estándar es por 4 días, contados desde la fecha de retiro. Si necesitás más días, contanos por WhatsApp y vemos disponibilidad.",
  },
  {
    pregunta: "¿Puedo comprar una prenda en vez de alquilarla?",
    respuesta:
      "Sí. Las prendas de la sección On Sale están en venta definitiva y se abonan al 100%, no tienen seña ni devolución.",
  },
  {
    pregunta: "¿Qué pasa si la prenda se mancha o se daña?",
    respuesta:
      "Al retirar la prenda coordinamos un depósito de garantía. Si hay daños más allá del uso normal, se descuenta de ese depósito el costo de arreglo o limpieza especial; te avisamos antes de aplicar cualquier descuento.",
  },
  {
    pregunta: "¿Puedo cancelar o cambiar mi reserva?",
    respuesta:
      "Escribinos por WhatsApp apenas sepas que necesitás cambiar la fecha o cancelar — cuanto antes nos avises, más fácil es reacomodar todo.",
  },
  {
    pregunta: "¿Qué medios de pago aceptan?",
    respuesta:
      "Por ahora coordinamos el pago directamente por WhatsApp. Muy pronto vas a poder pagar la seña o la compra online desde la web.",
  },
  {
    pregunta: "¿Cómo retiro y devuelvo la prenda?",
    respuesta:
      `Ambas cosas se hacen en el local de Punta Carretas, dentro de nuestro horario de atención. Coordinamos el horario exacto por WhatsApp al ${WHATSAPP_DISPLAY}.`,
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
          <h1 className="text-2xl font-normal tracking-tight text-negro">
            Preguntas frecuentes
          </h1>

          <div className="mt-8 flex flex-col divide-y divide-arena border-y border-arena">
            {PREGUNTAS.map(({ pregunta, respuesta }) => (
              <details key={pregunta} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-negro">
                  {pregunta}
                  <span className="shrink-0 text-taupe transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-chocolate">{respuesta}</p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-sm text-taupe">
            ¿Tu duda no está acá?{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-chocolate hover:underline"
            >
              Escribinos por WhatsApp
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
