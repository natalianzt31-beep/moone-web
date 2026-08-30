import { Nav } from "@/components/Nav";

export default function TerminosPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Términos y Condiciones — Môone Rental Boutique
          </h1>
          <p className="mt-1 text-sm text-taupe">Última actualización: 30/08/2026</p>

          <p className="mt-6 text-sm leading-6 text-chocolate">
            Al reservar o alquilar una prenda en Môone, aceptás las siguientes condiciones:
          </p>

          <div className="mt-8 flex flex-col gap-8">
            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                1. Cuidado de la prenda
              </h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Te comprometés a cuidar la prenda alquilada como propia durante todo el período de
                uso.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">2. Devolución</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                La prenda debe devolverse en la fecha y horario acordados en el local, ubicado en
                Prudencio Vázquez y Vega 887 esq. Sarmiento, Punta Carretas, Montevideo.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">3. Daños</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Ante cualquier mancha, rotura o daño ocurrido durante el uso, debés avisarnos de
                inmediato. Te hacés responsable del costo de reparación o limpieza especial que
                corresponda.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                4. Pérdida o daño irreparable
              </h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                En caso de pérdida o daño irreparable de la prenda, se abona el valor de reposición
                de la misma.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                5. Política de seña
              </h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                La seña abonada corresponde a la prenda reservada, que queda retirada de
                disponibilidad para esas fechas específicas. Si no retirás la prenda, la seña
                queda como saldo a favor en tu cuenta para una futura ocasión. Si avisás con
                anticipación, ese saldo puede usarse para cambiar el vestido señado por otro.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">6. Uso de fotos</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Si nos enviás o etiquetás fotos usando una prenda alquilada en Môone, y elegís
                autorizarlo, nos autorizás a usarlas sin cargo en nuestras redes sociales y
                comunicaciones de la marca. Esto es siempre opcional.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">7. Contacto</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Ante cualquier consulta sobre estos términos, escribinos a{" "}
                <a href="mailto:contacto@moone.com.uy" className="text-chocolate hover:underline">
                  contacto@moone.com.uy
                </a>{" "}
                o por WhatsApp al{" "}
                <a
                  href="https://wa.me/59894227223"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-chocolate hover:underline"
                >
                  094 227 223
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
