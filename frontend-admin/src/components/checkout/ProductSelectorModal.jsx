import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Search, Check } from "lucide-react";
import client from "../../api/client";

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith("http")) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || "";
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, "/api/uploads");
};

export default function ProductSelectorModal({
  open,
  onClose,
  onConfirm,
  multi = false,
  selectedIds = [],
  excludeIds = [],
  title = "Selecciona productos",
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set(selectedIds.map(String)));

  useEffect(() => {
    if (open) setSelected(new Set(selectedIds.map(String)));
  }, [open, selectedIds]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products-selector"],
    queryFn: async () => {
      const res = await client.get("/admin/products?per_page=200");
      const list = res.data?.items || res.data?.products || res.data;
      return Array.isArray(list) ? list : [];
    },
    enabled: open,
    staleTime: 30_000,
  });

  if (!open) return null;

  const filtered = products.filter((p) => {
    if (excludeIds.includes(String(p.id))) return false;
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleToggle = (id) => {
    const idStr = String(id);
    if (multi) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(idStr)) next.delete(idStr);
        else next.add(idStr);
        return next;
      });
    } else {
      setSelected(new Set([idStr]));
    }
  };

  const handleConfirm = () => {
    const ids = Array.from(selected);
    const selectedProducts = products.filter((p) => ids.includes(String(p.id)));
    onConfirm(selectedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b px-5 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#4DBEA4] focus:outline-none focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#4DBEA4]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No se encontraron productos</p>
          ) : (
            filtered.map((p) => {
              const isSelected = selected.has(String(p.id));
              const imgUrl =
                p.images?.[0]?.image_url || p.images?.[0]?.url || p.images?.[0] || null;
              return (
                <button
                  key={p.id}
                  onClick={() => handleToggle(p.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected ? "bg-[#4DBEA4]/10" : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded ${
                      multi ? "rounded" : "rounded-full"
                    } border-2 ${
                      isSelected
                        ? "border-[#4DBEA4] bg-[#4DBEA4] text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                  </div>
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {imgUrl ? (
                      <img
                        src={getImageUrl(imgUrl)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.id.slice(0, 8)}...</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <span className="text-xs text-gray-400">
            {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-medium text-white hover:bg-[#3da88e] disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
