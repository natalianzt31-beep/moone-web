import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { absoluteUrl } from "@/lib/site";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

/**
 * Se manda cuando alguien intenta crear una cuenta con un mail que ya está
 * registrado y confirmado. Supabase, por seguridad, no avisa nada en ese
 * caso (para no dejar "adivinar" qué mails ya están registrados) — este mail
 * es lo que le explica a esa persona qué pasó y cómo seguir.
 */
export async function enviarMailCuentaExistente(
  email: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const loginUrl = absoluteUrl(`/mi-cuenta/login?email=${encodeURIComponent(email)}`);
  const recuperarUrl = absoluteUrl(`/mi-cuenta/recuperar?email=${encodeURIComponent(email)}`);

  const html = `
    <p>Hola,</p>
    <p>Alguien (¡tal vez vos!) intentó crear una cuenta en Môone con este mail, pero ya tenías una.</p>
    <p>Para entrar, iniciá sesión con este mismo mail: <a href="${loginUrl}">Iniciar sesión</a>.</p>
    <p>¿No te acordás la contraseña? <a href="${recuperarUrl}">Restablecela acá</a>.</p>
    <p style="color:#A49587; font-size: 13px;">
      Si no fuiste vos, podés ignorar este mail — tu cuenta sigue segura. Cualquier duda,
      escribinos por WhatsApp al ${WHATSAPP_DISPLAY} (${WHATSAPP_URL}).
    </p>
  `.trim();

  const resultado = await enviarEmail({
    to: email,
    subject: "Ya tenés una cuenta en Môone",
    html,
  });

  await registrarEnvioEmail({
    tipo: "cuenta_existente",
    destinatario: email,
    resultado,
  });

  return resultado;
}
