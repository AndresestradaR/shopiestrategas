import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Pencil,
  X,
  Star,
  Settings2,
  ShoppingCart,
  Type,
} from "lucide-react";
import client from "../api/client";

const CHECKOUT_FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "surname", label: "Apellido" },
  { key: "phone", label: "Telefono" },
  { key: "email", label: "Email" },
  { key: "dni", label: "Cedula / DNI" },
  { key: "city", label: "Ciudad" },
  { key: "state", label: "Departamento / Estado" },
  { key: "neighborhood", label: "Barrio" },
  { key: "zip_code", label: "Codigo postal" },
  { key: "address_notes", label: "Notas de direccion" },
];

/* ------------------------------------------------------------------ */
/*  Checkout fields toggle section                                     */
/* ------------------------------------------------------------------ */
function CheckoutFieldsSection({ config, onSaved }) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState({});

  useEffect(() => {
    if (config?.checkout_fields) {
      setFields(config.checkout_fields);
    } else {
      const defaults = {};
      CHECKOUT_FIELDS.forEach((f) => (defaults[f.key] = true));
      setFields(defaults);
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: (data) => client.put("/admin/config", data),
    onSuccess: () => {
      toast.success("Campos del checkout actualizados");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
      onSaved?.();
    },
    onError: () => toast.error("Error al guardar los campos"),
  });

  const toggle = (key) => setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 size={20} className="text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Campos del checkout</h2>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Activa o desactiva los campos que se muestran en el formulario de checkout.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHECKOUT_FIELDS.map((f) => (
          <label
            key={f.key}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">{f.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={!!fields[f.key]}
              onClick={() => toggle(f.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                fields[f.key] ? "bg-[#4DBEA4]" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  fields[f.key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => mutation.mutate({ checkout_fields: fields })}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar campos
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Customization section (title + success message)                    */
/* ------------------------------------------------------------------ */
function CustomizationSection({ config }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (config) {
      reset({
        checkout_title: config.checkout_title || "",
        checkout_success_message: config.checkout_success_message || "",
      });
    }
  }, [config, reset]);

  const mutation = useMutation({
    mutationFn: (data) => client.put("/admin/config", data),
    onSuccess: () => {
      toast.success("Personalizacion guardada");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
    },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Type size={20} className="text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Personalizacion del checkout</h2>
      </div>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Titulo del checkout</label>
          <input
            {...register("checkout_title")}
            placeholder="Ej: Completa tu pedido"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mensaje de confirmacion</label>
          <textarea
            {...register("checkout_success_message")}
            rows={3}
            placeholder="Ej: Gracias por tu compra! Te contactaremos pronto."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar personalizacion
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Offers section                                                     */
/* ------------------------------------------------------------------ */
function OfferRow({ offer, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">{offer.quantity}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        ${Number(offer.price).toLocaleString("es-CO")}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{offer.label || "---"}</td>
      <td className="px-4 py-3">
        {offer.is_highlighted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <Star size={12} /> Destacada
          </span>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(offer)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(offer.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function OfferFormModal({ offer, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!offer?.id;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      quantity: offer?.quantity || 1,
      price: offer?.price || "",
      label: offer?.label || "",
      is_highlighted: offer?.is_highlighted || false,
      name: offer?.name || "",
      rules: offer?.rules ? JSON.stringify(offer.rules, null, 2) : "[]",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
        price: Number(data.price),
        rules: JSON.parse(data.rules || "[]"),
      };
      if (isEdit) {
        return client.put(`/admin/checkout/offers/${offer.id}`, payload);
      }
      return client.post("/admin/checkout/offers", payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Oferta actualizada" : "Oferta creada");
      queryClient.invalidateQueries({ queryKey: ["checkout-offers"] });
      onClose();
    },
    onError: () => toast.error("Error al guardar la oferta"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar oferta" : "Nueva oferta"}
          </h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la oferta</label>
            <input
              {...register("name")}
              placeholder="Ej: Oferta x2"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                min={1}
                {...register("quantity", { required: "Requerido" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                min={0}
                {...register("price", { required: "Requerido" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Etiqueta</label>
            <input
              {...register("label")}
              placeholder="Ej: Mas popular"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("is_highlighted")} className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]" />
            <span className="text-sm text-gray-700">Destacar esta oferta</span>
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reglas (JSON)</label>
            <textarea
              {...register("rules")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OffersSection() {
  const queryClient = useQueryClient();
  const [editingOffer, setEditingOffer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["checkout-offers"],
    queryFn: async () => {
      const res = await client.get("/admin/checkout/offers");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/checkout/offers/${id}`),
    onSuccess: () => {
      toast.success("Oferta eliminada");
      queryClient.invalidateQueries({ queryKey: ["checkout-offers"] });
    },
    onError: () => toast.error("Error al eliminar la oferta"),
  });

  const handleDelete = (id) => {
    if (window.confirm("Estas seguro de eliminar esta oferta?")) {
      deleteMutation.mutate(id);
    }
  };

  const offerList = Array.isArray(offers) ? offers : offers?.items || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Ofertas por cantidad</h2>
        </div>
        <button
          onClick={() => { setEditingOffer(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Agregar oferta
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : offerList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <ShoppingCart size={36} className="mb-2" />
          <p className="text-sm">No hay ofertas configuradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-500">Cantidad</th>
                <th className="px-4 py-3 font-medium text-gray-500">Precio</th>
                <th className="px-4 py-3 font-medium text-gray-500">Etiqueta</th>
                <th className="px-4 py-3 font-medium text-gray-500">Destacada</th>
                <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {offerList.map((offer) => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  onEdit={(o) => { setEditingOffer(o); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <OfferFormModal
          offer={editingOffer}
          onClose={() => { setShowForm(false); setEditingOffer(null); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Checkout() {
  const { data: config, isLoading, isError, error } = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => {
      const res = await client.get("/admin/config");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle size={20} />
        <span>Error al cargar la configuracion: {error?.message || "Intenta de nuevo"}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configura los campos, personalizacion y ofertas de tu checkout
        </p>
      </div>

      <div className="space-y-6">
        <CheckoutFieldsSection config={config} />
        <CustomizationSection config={config} />
        <OffersSection />
      </div>
    </div>
  );
}
