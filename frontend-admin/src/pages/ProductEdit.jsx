import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  X,
  ImageIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Code,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}${imgUrl}`;
};

// Rich Text Editor - uses contentEditable + execCommand for lightweight formatting.
// Content is HTML from the authenticated store owner editing their own product descriptions.
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [showSource, setShowSource] = useState(false);

  const execCmd = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleLink = () => {
    const url = prompt("URL del enlace:");
    if (url) execCmd("createLink", url);
  };

  const ToolBtn = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 ${
        active ? "bg-gray-200 text-gray-900" : ""
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-[#4DBEA4] focus-within:ring-2 focus-within:ring-[#4DBEA4]/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolBtn onClick={() => execCmd("bold")} title="Negrita"><Bold size={14} /></ToolBtn>
        <ToolBtn onClick={() => execCmd("italic")} title="Cursiva"><Italic size={14} /></ToolBtn>
        <ToolBtn onClick={() => execCmd("underline")} title="Subrayado"><Underline size={14} /></ToolBtn>
        <ToolBtn onClick={() => execCmd("strikeThrough")} title="Tachado"><Strikethrough size={14} /></ToolBtn>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <ToolBtn onClick={() => execCmd("insertUnorderedList")} title="Lista"><List size={14} /></ToolBtn>
        <ToolBtn onClick={() => execCmd("insertOrderedList")} title="Lista numerada"><ListOrdered size={14} /></ToolBtn>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <ToolBtn onClick={() => execCmd("justifyLeft")} title="Izquierda"><AlignLeft size={14} /></ToolBtn>
        <ToolBtn onClick={() => execCmd("justifyCenter")} title="Centrar"><AlignCenter size={14} /></ToolBtn>
        <ToolBtn onClick={() => execCmd("justifyRight")} title="Derecha"><AlignRight size={14} /></ToolBtn>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <ToolBtn onClick={handleLink} title="Enlace"><LinkIcon size={14} /></ToolBtn>
        <ToolBtn onClick={() => setShowSource(!showSource)} active={showSource} title="HTML"><Code size={14} /></ToolBtn>
      </div>
      {showSource ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] w-full px-4 py-3 font-mono text-xs text-gray-700 outline-none"
          placeholder="<p>Escribe HTML aqui...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          className="prose prose-sm min-h-[200px] max-w-none px-4 py-3 text-sm text-gray-900 outline-none [&_a]:text-[#4DBEA4]"
          dangerouslySetInnerHTML={{ __html: value || "" }}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
        />
      )}
    </div>
  );
}

function TagInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const tags = value ? value.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed].join(", "));
    setInput("");
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index).join(", "));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) removeTag(tags.length - 1);
  };

  return (
    <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#4DBEA4] focus-within:ring-2 focus-within:ring-[#4DBEA4]/20">
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? "Escribe y presiona Enter..." : ""}
        className="min-w-[100px] flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

export default function ProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [variants, setVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({ name: "", variant_value: "", price_override: "", stock: "" });
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { is_active: true, is_featured: false },
  });

  const watchPrice = watch("price");
  const watchCost = watch("cost_price");
  const watchDescription = watch("description");
  const watchTags = watch("tags");

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => { const res = await client.get(`/admin/products/${id}`); return res.data; },
    enabled: !isNew,
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        description: product.description || "",
        short_description: product.short_description || "",
        price: product.price || "",
        compare_at_price: product.compare_at_price || "",
        cost_price: product.cost_price || "",
        sku: product.sku || "",
        dropi_product_id: product.dropi_product_id || "",
        tags: (product.tags || []).join(", "),
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
      });
      setVariants(product.variants || []);
      setImages(product.images || []);
    }
  }, [product, reset]);

  const margin = watchPrice && watchCost
    ? (((parseFloat(watchPrice) - parseFloat(watchCost)) / parseFloat(watchPrice)) * 100).toFixed(1)
    : null;
  const profit = watchPrice && watchCost ? parseFloat(watchPrice) - parseFloat(watchCost) : null;

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_active: typeof formData.is_active === "string" ? formData.is_active === "true" : Boolean(formData.is_active),
        variants: variants.map((v) => ({ name: v.name, variant_value: v.variant_value, price_override: v.price_override, stock: v.stock })),
      };
      if (isNew) { const res = await client.post("/admin/products", payload); return res.data; }
      else { const res = await client.put(`/admin/products/${id}`, payload); return res.data; }
    },
    onSuccess: (data) => {
      toast.success(isNew ? "Producto creado exitosamente" : "Producto actualizado");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (isNew && data?.id) navigate(`/products/${data.id}`);
    },
    onError: (err) => { toast.error(err.response?.data?.detail || "Error al guardar el producto"); },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (isNew) { toast.error("Guarda el producto primero antes de subir imagenes"); return; }
    setUploadingImage(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await client.post(`/admin/products/${id}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        setImages((prev) => [...prev, res.data]);
      }
      toast.success(files.length > 1 ? `${files.length} imagenes subidas` : "Imagen subida");
    } catch (err) { toast.error(err.response?.data?.detail || "Error al subir la imagen"); }
    finally { setUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDeleteImage = async (imageId) => {
    try { await client.delete(`/admin/products/${id}/images/${imageId}`); setImages((prev) => prev.filter((img) => img.id !== imageId)); toast.success("Imagen eliminada"); }
    catch { toast.error("Error al eliminar la imagen"); }
  };

  const handleAddVariant = () => {
    if (!variantForm.name || !variantForm.variant_value) { toast.error("Nombre y valor son obligatorios"); return; }
    const nv = { id: editingVariant?.id || `temp-${Date.now()}`, name: variantForm.name, variant_value: variantForm.variant_value, price_override: variantForm.price_override ? parseFloat(variantForm.price_override) : null, stock: variantForm.stock ? parseInt(variantForm.stock) : null };
    if (editingVariant) { setVariants((prev) => prev.map((v) => (v.id === editingVariant.id ? nv : v))); setEditingVariant(null); }
    else { setVariants((prev) => [...prev, nv]); }
    setVariantForm({ name: "", variant_value: "", price_override: "", stock: "" });
  };

  const handleEditVariant = (v) => { setEditingVariant(v); setVariantForm({ name: v.name || "", variant_value: v.variant_value || "", price_override: v.price_override ?? "", stock: v.stock ?? "" }); };
  const handleDeleteVariant = (vid) => { setVariants((prev) => prev.filter((v) => v.id !== vid)); if (editingVariant?.id === vid) { setEditingVariant(null); setVariantForm({ name: "", variant_value: "", price_override: "", stock: "" }); } };
  const onSubmit = (data) => saveMutation.mutate(data);

  if (!isNew && isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  if (!isNew && isError) return <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={20} /><span>Error: {error?.message}</span></div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate("/products")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Nuevo producto" : "Editar producto"}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{isNew ? "Completa la informacion del producto" : product?.name || ""}</p>
          </div>
        </div>
        <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting || saveMutation.isPending} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: "#4DBEA4" }}>
          {isSubmitting || saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isNew ? "Crear producto" : "Guardar"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Titulo</label>
                <input type="text" placeholder="Ej: Camiseta deportiva premium" className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/20"}`} {...register("name", { required: "El nombre es obligatorio" })} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripcion</label>
                <RichTextEditor value={watchDescription || ""} onChange={(html) => setValue("description", html)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripcion corta</label>
                <input type="text" placeholder="Breve descripcion para listados y SEO" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20" {...register("short_description")} />
              </div>
            </div>

            {/* Multimedia */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Multimedia</h3>
              {images.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {images.map((img, index) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img src={getImageUrl(img.image_url)} alt="Producto" className="h-full w-full object-cover" />
                      {index === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">Principal</span>}
                      <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow group-hover:opacity-100"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <div onClick={() => !uploadingImage && !isNew && fileInputRef.current?.click()} className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${isNew ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60" : "border-gray-300 bg-gray-50/50 hover:border-[#4DBEA4] hover:bg-[#4DBEA4]/5"}`}>
                {uploadingImage ? <Loader2 size={32} className="mb-2 animate-spin text-gray-400" /> : <ImageIcon size={32} className="mb-2 text-gray-400" />}
                <p className="text-sm font-medium text-gray-600">{uploadingImage ? "Subiendo..." : "Arrastra imagenes aqui o haz clic para subir"}</p>
                <p className="mt-1 text-xs text-gray-400">{isNew ? "Guarda el producto primero para subir imagenes" : "JPG, PNG o WebP. Puedes seleccionar varios archivos."}</p>
              </div>
            </div>

            {/* Variants */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Variantes</h3>
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <input type="text" placeholder="Nombre (ej: Color)" value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4]" />
                <input type="text" placeholder="Valor (ej: Rojo)" value={variantForm.variant_value} onChange={(e) => setVariantForm({ ...variantForm, variant_value: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4]" />
                <input type="number" placeholder="Precio" value={variantForm.price_override} onChange={(e) => setVariantForm({ ...variantForm, price_override: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4]" />
                <input type="number" placeholder="Stock" value={variantForm.stock} onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4]" />
                <button type="button" onClick={handleAddVariant} className="inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#4DBEA4" }}><Plus size={16} />{editingVariant ? "Actualizar" : "Agregar"}</button>
              </div>
              {editingVariant && <button type="button" onClick={() => { setEditingVariant(null); setVariantForm({ name: "", variant_value: "", price_override: "", stock: "" }); }} className="mb-3 text-xs text-gray-500 hover:text-gray-700">Cancelar edicion</button>}
              {variants.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-gray-200 bg-gray-50"><th className="px-3 py-2 text-xs font-medium text-gray-500">Nombre</th><th className="px-3 py-2 text-xs font-medium text-gray-500">Valor</th><th className="px-3 py-2 text-xs font-medium text-gray-500">Precio</th><th className="px-3 py-2 text-xs font-medium text-gray-500">Stock</th><th className="px-3 py-2" /></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {variants.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{v.name}</td>
                          <td className="px-3 py-2 text-gray-700">{v.variant_value}</td>
                          <td className="px-3 py-2 text-gray-700">{v.price_override != null ? formatCurrency(v.price_override) : "---"}</td>
                          <td className="px-3 py-2 text-gray-700">{v.stock ?? "---"}</td>
                          <td className="px-3 py-2"><div className="flex justify-end gap-2"><button type="button" onClick={() => handleEditVariant(v)} className="text-xs text-[#4DBEA4] hover:underline">Editar</button><button type="button" onClick={() => handleDeleteVariant(v.id)} className="text-xs text-red-500 hover:underline">Eliminar</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="py-4 text-center text-sm text-gray-400">No hay variantes agregadas</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Estado</h3>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20" {...register("is_active")}>
                <option value="true">Activo</option>
                <option value="false">Borrador</option>
              </select>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]" {...register("is_featured")} />
                  <div className="flex items-center gap-1.5"><Star size={14} className="text-amber-400" /><span className="text-sm text-gray-700">Producto destacado</span></div>
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Precios</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Precio de venta</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input type="number" step="1" placeholder="0" className={`w-full rounded-lg border py-2.5 pl-7 pr-4 text-sm text-gray-900 outline-none focus:ring-2 ${errors.price ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/20"}`} {...register("price", { required: "Obligatorio", min: { value: 0, message: "Positivo" } })} />
                  </div>
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Precio de comparacion</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input type="number" step="1" placeholder="Precio antes" className="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-4 text-sm text-gray-900 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20" {...register("compare_at_price")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Costo por articulo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input type="number" step="1" placeholder="Costo" className="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-4 text-sm text-gray-900 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20" {...register("cost_price")} />
                  </div>
                </div>
                {margin !== null && profit !== null && (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">Margen: <span className="font-semibold text-gray-900">{margin}%</span> ({formatCurrency(profit)} ganancia)</div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Inventario</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">SKU</label>
                  <input type="text" placeholder="SKU del producto" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20" {...register("sku")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">ID Producto Dropi</label>
                  <input type="text" placeholder="ID en Dropi" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20" {...register("dropi_product_id")} />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Etiquetas</h3>
              <TagInput value={watchTags || ""} onChange={(val) => setValue("tags", val)} />
            </div>
          </div>
        </div>

        {/* Mobile save */}
        <div className="mt-6 flex justify-end pb-8 lg:hidden">
          <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: "#4DBEA4" }}>
            {isSubmitting || saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isNew ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
