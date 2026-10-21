"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { LeadPronovias } from "@/lib/supabase/types";

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsappLink(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos.startsWith("598") ? digitos : `598${digitos.replace(/^0/, "")}`}`;
}

function PronoviasContent() {
  const [leads, setLeads] = useState<LeadPronovias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      setError(null);
      const { data, error } = await getSupabaseClient()
        .from("leads_pronovias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setLeads((data ?? []) as LeadPronovias[]);
      }
      setLoading(false);
    }
    cargar();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
          Pronovias × Cecilia Méndez
        </h1>
        <p className="mt-1 text-sm text-chocolate">
          Leads del formulario de /pronovias.
        </p>
      </div>

      {loading && <p className="mt-8 text-sm text-taupe">Cargando leads...</p>}

      {!loading && error && (
        <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
      )}

      {!loading && !error && leads.length === 0 && (
        <p className="mt-8 text-sm text-taupe">Todavía no hay leads.</p>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-3 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-base font-medium text-negro">{lead.nombre}</p>
                <p className="text-xs text-taupe">{formatFechaHora(lead.created_at)}</p>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-taupe">WhatsApp</dt>
                  <dd className="text-chocolate">
                    <a
                      href={whatsappLink(lead.celular)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-negro hover:underline"
                    >
                      {lead.celular}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-taupe">Email</dt>
                  <dd className="text-chocolate">
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:text-negro hover:underline"
                    >
                      {lead.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-taupe">
                    Fecha de casamiento estimada
                  </dt>
                  <dd className="text-chocolate">
                    {lead.fecha_casamiento_estimada
                      ? formatFecha(lead.fecha_casamiento_estimada)
                      : "No especificó"}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPronoviasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <PronoviasContent />
        </main>
      </RequireStaff>
    </div>
  );
}
