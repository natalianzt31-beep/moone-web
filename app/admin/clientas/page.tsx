"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/supabase/types";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const emptyForm = {
  nombre: "",
  celular: "",
  email: "",
  documento: "",
  notas: "",
  consiente_promos: true,
};

function ClientasContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getSupabaseClient()
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setClients(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!busqueda) return clients;
    const q = busqueda.toLowerCase();
    return clients.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.celular ?? "").includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [clients, busqueda]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await getSupabaseClient().from("clients").insert({
        nombre: form.nombre.trim(),
        celular: form.celular.trim() || null,
        email: form.email.trim() || null,
        documento: form.documento.trim() || null,
        notas: form.notas.trim() || null,
        consiente_promos: form.consiente_promos,
      });

      if (error) {
        setFormError(
          error.code === "23505" ? "Ya existe una clienta con ese celular." : error.message
        );
        return;
      }

      setForm(emptyForm);
      setShowForm(false);
      await loadClients();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setEditError(null);
    setEditForm({
      nombre: client.nombre,
      celular: client.celular ?? "",
      email: client.email ?? "",
      documento: client.documento ?? "",
      notas: client.notas ?? "",
      consiente_promos: client.consiente_promos,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleSaveEdit(clientId: string) {
    if (!editForm.nombre.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const { error } = await getSupabaseClient()
        .from("clients")
        .update({
          nombre: editForm.nombre.trim(),
          celular: editForm.celular.trim() || null,
          email: editForm.email.trim() || null,
          documento: editForm.documento.trim() || null,
          notas: editForm.notas.trim() || null,
          consiente_promos: editForm.consiente_promos,
        })
        .eq("id", clientId);

      if (error) {
        setEditError(
          error.code === "23505" ? "Ya existe una clienta con ese celular." : error.message
        );
        return;
      }

      await loadClients();
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">Clientas</h1>
          <p className="mt-1 text-sm text-chocolate">Alta y listado de clientas.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
        >
          {showForm ? "Cancelar" : "+ Nueva clienta"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 rounded-[3px] border border-arena bg-blanco p-4 sm:grid-cols-2 sm:p-6"
        >
          <label className="flex flex-col gap-1 text-sm text-negro">
            Nombre
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Celular
            <input
              type="text"
              value={form.celular}
              onChange={(e) => setForm((f) => ({ ...f, celular: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Documento
            <input
              type="text"
              value={form.documento}
              onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro sm:col-span-2">
            Notas
            <textarea
              value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
              rows={2}
              className={`${inputClass} min-h-0`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-negro sm:col-span-2">
            <input
              type="checkbox"
              checked={form.consiente_promos}
              onChange={(e) => setForm((f) => ({ ...f, consiente_promos: e.target.checked }))}
            />
            Acepta recibir promociones por mail
          </label>

          {formError && <p className="text-sm text-chocolate sm:col-span-2">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60 sm:col-span-2"
          >
            {saving ? "Guardando..." : "Crear clienta"}
          </button>
        </form>
      )}

      <div className="mt-6">
        <input
          type="text"
          placeholder="Buscar por nombre, celular o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={`${inputClass} w-full sm:max-w-sm`}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-[3px] border border-arena">
        <table className="min-w-full divide-y divide-arena">
          <thead className="bg-crema">
            <tr>
              {["Nombre", "Celular", "Email", "Cuenta", "Alquileres", "Alta", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-arena bg-blanco">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-taupe">
                  Cargando clientas...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-chocolate">
                  Error al cargar clientas: {error}
                </td>
              </tr>
            )}

            {!loading && !error && clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-taupe">
                  No hay clientas que coincidan con la búsqueda.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              clientesFiltrados.map((client) =>
                editingId === client.id ? (
                  <tr key={client.id} className="bg-crema">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                        className={`${inputClass} w-full`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.celular}
                        onChange={(e) => setEditForm((f) => ({ ...f, celular: e.target.value }))}
                        className={`${inputClass} w-32`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className={`${inputClass} w-full`}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-taupe">
                      {client.auth_user_id ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-3 text-sm text-taupe">
                      {client.alquileres_completados}
                    </td>
                    <td className="px-4 py-3 text-sm text-taupe">
                      {new Date(client.created_at).toLocaleDateString("es-UY")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {editError && <p className="text-xs text-chocolate">{editError}</p>}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={editSaving}
                            onClick={() => handleSaveEdit(client.id)}
                            className="flex min-h-11 items-center rounded-[3px] bg-negro px-3 text-xs uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
                          >
                            {editSaving ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            type="button"
                            disabled={editSaving}
                            onClick={cancelEdit}
                            className="flex min-h-11 items-center rounded-[3px] border border-arena px-3 text-xs uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={client.id}>
                    <td className="px-4 py-3 text-sm font-medium text-negro">{client.nombre}</td>
                    <td className="px-4 py-3 text-sm text-chocolate">{client.celular ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-chocolate">{client.email ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-chocolate">
                      {client.auth_user_id ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-3 text-sm text-chocolate">
                      {client.alquileres_completados}
                    </td>
                    <td className="px-4 py-3 text-sm text-chocolate">
                      {new Date(client.created_at).toLocaleDateString("es-UY")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() => startEdit(client)}
                        className="flex min-h-11 items-center rounded-[3px] border border-arena px-3 text-xs uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>

      {!loading && !error && (
        <p className="mt-3 text-sm text-taupe">
          {clientesFiltrados.length} de {clients.length} clientas
        </p>
      )}
    </div>
  );
}

export default function AdminClientasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <ClientasContent />
        </main>
      </RequireStaff>
    </div>
  );
}
