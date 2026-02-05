import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Save,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const STATUS_COLORS = {
  PENDIENTE: "bg-yellow-50 text-yellow-700 border-yellow-300",
  CONFIRMADO: "bg-blue-50 text-blue-700 border-blue-300",
  ENVIADO: "bg-purple-50 text-purple-700 border-purple-300",
  ENTREGADO: "bg-green-50 text-green-700 border-green-300",
  CANCELADO: "bg-red-50 text-red-700 border-red-300",
};

const TIMELINE_STEPS = [
  { key: "PENDIENTE", label: "Pendiente", icon: Clock },
  { key: "CONFIRMADO", label: "Confirmado", icon: CheckCircle2 },
  { key: "ENVIADO", label: "Enviado", icon: Truck },
  { key: "ENTREGADO", label: "Entregado", icon: Package },
];

const STATUS_ORDER = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO"];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState("");
  const [notesInitialized, setNotesInitialized] = useState(false);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await client.get(`/admin/orders/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      if (!notesInitialized) {
        setAdminNotes(data.admin_notes || data.notes || "");
        setNotesInitialized(true);
      }
    },
  });

  const notesMutation = useMutation({
    mutationFn: async () => {
      await client.patch(`/admin/orders/${id}`, { admin_notes: adminNotes });
    },
    onSuccess: () => {
      toast.success("Notas guardadas");
      queryClient.invalidateQueries(["order", id]);
    },
    onError: () => {
      toast.error("Error al guardar las notas");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      await client.patch(`/admin/orders/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      toast.error("Error al actualizar el estado");
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
        <span>Error al cargar el pedido: {error?.message}</span>
      </div>
    );
  }

  if (!order) return null;

  const items = order.items || order.order_items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1), 0);
  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "CANCELADO";

  const phone = (order.customer_phone || "").replace(/\D/g, "");
  const whatsappUrl = phone ? `https://wa.me/${phone}` : null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{order.order_number || order.id}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDate(order.created_at)}
          </p>
        </div>

        {/* Status update dropdown */}
        <select
          value={order.status}
          onChange={(e) => statusMutation.mutate(e.target.value)}
          disabled={statusMutation.isLoading}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Productos</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 font-medium text-gray-500">Producto</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Cant.</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Precio</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const unitPrice = item.price || item.unit_price || 0;
                  const qty = item.quantity || 1;
                  return (
                    <tr key={item.id || idx}>
                      <td className="py-3 text-gray-900">
                        {item.product_name || item.name || "Producto"}
                        {item.variant_name && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({item.variant_name})
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center text-gray-700">{qty}</td>
                      <td className="py-3 text-right text-gray-700">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {formatCurrency(unitPrice * qty)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 space-y-1 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {(order.shipping_cost != null && order.shipping_cost > 0) && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envio</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
              )}
              {(order.discount != null && order.discount > 0) && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total || order.total_price || subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Seguimiento</h2>
            {isCancelled ? (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <XCircle size={20} />
                <span>Este pedido fue cancelado</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCompleted = currentStatusIdx >= idx;
                  const isCurrent = currentStatusIdx === idx;

                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                            isCompleted
                              ? "border-[#4DBEA4] bg-[#4DBEA4] text-white"
                              : "border-gray-200 bg-white text-gray-400"
                          }`}
                        >
                          <StepIcon size={18} />
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`mx-2 h-0.5 flex-1 ${
                            currentStatusIdx > idx ? "bg-[#4DBEA4]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Notas internas</h2>
            <textarea
              rows={3}
              placeholder="Agrega notas sobre este pedido..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => notesMutation.mutate()}
                disabled={notesMutation.isLoading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#4DBEA4" }}
              >
                {notesMutation.isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Guardar notas
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Customer info */}
        <div className="space-y-6">
          {/* Customer card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Cliente</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="shrink-0 text-gray-400" />
                <span className="text-gray-900">
                  {order.customer_name || "---"}
                  {order.customer_surname && ` ${order.customer_surname}`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <span className="text-gray-700">{order.customer_phone || "---"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="shrink-0 text-gray-400" />
                <span className="text-gray-700">{order.customer_email || "---"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div className="text-gray-700">
                  <p>{order.address || "---"}</p>
                  {(order.city || order.state) && (
                    <p className="text-gray-500">
                      {[order.city, order.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              {order.customer_dni && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="shrink-0 text-gray-400 text-xs font-bold w-4 text-center">ID</span>
                  <span className="text-gray-700">{order.customer_dni}</span>
                </div>
              )}
            </div>

            {/* WhatsApp button */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                <MessageCircle size={16} />
                WhatsApp al cliente
              </a>
            )}
          </div>

          {/* Shipping info */}
          {(order.shipping_method || order.tracking_number) && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Envio</h2>
              <div className="space-y-2 text-sm">
                {order.shipping_method && (
                  <div>
                    <span className="text-gray-500">Metodo: </span>
                    <span className="text-gray-900">{order.shipping_method}</span>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <span className="text-gray-500">Guia: </span>
                    <span className="font-medium text-gray-900">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
