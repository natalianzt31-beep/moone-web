import { Nav } from "@/components/Nav";

export default function PrivacidadPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Política de Privacidad — Môone Rental Boutique
          </h1>
          <p className="mt-1 text-sm text-taupe">Última actualización: 30/08/2026</p>

          <p className="mt-6 text-sm leading-6 text-chocolate">
            En Môone (moone.com.uy) valoramos tu privacidad. Esta política explica qué datos
            recopilamos, para qué los usamos y cómo los protegemos.
          </p>

          <div className="mt-8 flex flex-col gap-8">
            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                1. Qué datos recopilamos
              </h2>
              <ul className="mt-2 flex flex-col gap-2 text-sm leading-6 text-chocolate">
                <li>
                  <strong className="font-medium text-negro">Datos de cuenta</strong>: nombre,
                  email, celular, y contraseña (o datos básicos de tu cuenta de Google si
                  iniciás sesión con Google: nombre y email).
                </li>
                <li>
                  <strong className="font-medium text-negro">Datos de reservas</strong>:
                  producto reservado, fechas, forma de pago, historial de alquileres.
                </li>
                <li>
                  <strong className="font-medium text-negro">Comunicaciones</strong>: si nos
                  autorizás, te enviamos mensajes por WhatsApp relacionados a tu reserva
                  (confirmación, recordatorios, e-ticket) y, si lo aceptás, promociones.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                2. Para qué usamos tus datos
              </h2>
              <ul className="mt-2 flex flex-col gap-2 text-sm leading-6 text-chocolate">
                <li>Gestionar tu reserva, retiro y devolución de prendas.</li>
                <li>Enviarte confirmaciones y avisos relacionados a tu alquiler.</li>
                <li>Mantener tu historial de alquileres y tu tarjeta de fidelidad.</li>
                <li>
                  Enviarte promociones, solo si diste tu consentimiento explícito para eso.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                3. Con quién compartimos tus datos
              </h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                No vendemos ni compartimos tus datos personales con terceros para fines
                comerciales ajenos a Môone. Usamos proveedores de servicio (como Supabase para
                almacenamiento de datos, Vercel para el hosting de la web, y Twilio/WhatsApp
                Business para el envío de mensajes) que procesan datos en nuestro nombre bajo
                sus propias políticas de seguridad.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                4. Inicio de sesión con Google
              </h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Si elegís iniciar sesión con tu cuenta de Google, solo accedemos a tu nombre y
                dirección de email para crear e identificar tu cuenta en Môone. No accedemos a
                tu Gmail, Drive ni ningún otro dato de tu cuenta de Google.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">
                5. Fotos que nos compartís
              </h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Si nos enviás o etiquetás fotos usando una prenda alquilada en Môone, nos
                autorizás a usarlas, sin cargo, en nuestras redes sociales y comunicaciones de
                la marca. Esto es opcional: solo se aplica si decidís compartirnos esas fotos.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">6. Tus derechos</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Podés pedirnos en cualquier momento que te mostremos, corrijamos o eliminemos
                tus datos personales, escribiéndonos a{" "}
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

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">7. Seguridad</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Tus datos se almacenan en servidores con acceso restringido y cifrado, y solo
                el personal autorizado de Môone puede acceder a la información de clientas.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-negro sm:text-lg">8. Contacto</h2>
              <p className="mt-2 text-sm leading-6 text-chocolate">
                Ante cualquier consulta sobre esta política, escribinos a{" "}
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
