/**
 * Plantillas HTML de mails, con placeholders {{tal_cual}} para reemplazar
 * con .replace()/.replaceAll(). Server-only por convención (solo se usan
 * desde código de lib/email), aunque no importan nada que lo requiera.
 */

export const PLANTILLA_CONFIRMACION_RESERVA = `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#F8F5EF; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F5EF; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-radius: 4px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#FFFFFF; padding: 36px 20px 24px; border-bottom: 1px solid #EFE9DF;">
              <img src="https://moone.com.uy/logo.png" alt="Môone Rental Boutique" width="140" style="display:block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 36px;">
              <h1 style="font-family: Georgia, serif; color:#171513; font-size: 24px; font-weight: 500; margin: 0 0 16px;">
                ¡Reserva confirmada!
              </h1>
              <p style="color:#4A3A31; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
                Recibimos tu seña. Estas son las prendas que reservaste:
              </p>

              <!-- Items -->
              {{items_html}}

              <!-- Resumen -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 28px; background-color:#EFE9DF; border-radius: 3px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#4A3A31; font-size: 14px; padding: 4px 0;">Fecha de retiro</td>
                        <td align="right" style="color:#171513; font-size: 14px; font-weight:600; padding: 4px 0;">{{fecha_retiro}}</td>
                      </tr>
                      <tr>
                        <td style="color:#4A3A31; font-size: 14px; padding: 4px 0;">Fecha de devolución</td>
                        <td align="right" style="color:#171513; font-size: 14px; font-weight:600; padding: 4px 0;">{{fecha_devolucion}}</td>
                      </tr>
                      <tr><td colspan="2" style="border-top: 1px solid #D8CCBD; padding-top:8px; margin-top:8px;"></td></tr>
                      <tr>
                        <td style="color:#4A3A31; font-size: 14px; padding: 4px 0;">Seña pagada</td>
                        <td align="right" style="color:#171513; font-size: 14px; font-weight:600; padding: 4px 0;">\${{monto_senia}}</td>
                      </tr>
                      <tr>
                        <td style="color:#4A3A31; font-size: 14px; padding: 4px 0;">Saldo a pagar al retirar</td>
                        <td align="right" style="color:#171513; font-size: 14px; font-weight:600; padding: 4px 0;">\${{saldo_pendiente}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#A49587; font-size: 13px; line-height: 1.6; margin: 0;">
                Te avisamos de nuevo el día del retiro con el horario y las condiciones. Cualquier consulta, escribinos por WhatsApp al 094 227 223.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#EFE9DF; padding: 20px 36px; text-align:center;">
              <p style="color:#4A3A31; font-size: 12px; margin: 0 0 4px;">
                Prudencio Vázquez y Vega 887 esq. Sarmiento, Punta Carretas, Montevideo
              </p>
              <p style="color:#A49587; font-size: 12px; margin: 0;">
                contacto@moone.com.uy · WhatsApp 094 227 223
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
