import { useState, useRef } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

export default function ProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [variants, setVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({ name: "", value: "", price: "", stock: "" });
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // Fetch product data if editing
  const { isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await client.get(`/admin/products/${id}`);
      return res.data;
    },
    enabled: !isNew,
    onSuccess: (product) => {
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
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        variants,
      };

      if (isNew) {
        const res = await client.post("/admin/products", payload);
        return res.data;
      } else {
        const res = await client.put(`/admin/products/${id}`, payload);
        return res.data;
      }
    },
    onSuccess: (data) => {
      toast.success(isNew ? "Producto creado exitosamente" : "Producto actualizado");
      queryClient.invalidateQueries(["products"]);
      if (isNew && data?.id) {
        navigate(`/products/${data.id}`);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Error al guardar el producto");
    },
  });

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isNew) {
      toast.error("Guarda el producto primero antes de subir imagenes");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await client.post(`/admin/products/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, res.data]);
      toast.success("Imagen subida");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al subir la imagen");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId) => {
    try {
      await client.delete(`/admin/products/${id}/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Imagen eliminada");
    } catch (err) {
      toast.error("Error al eliminar la imagen");
    }
  };

  // Variant helpers
  const handleAddVariant = () => {
    if (!variantForm.name || !variantForm.value) {
      toast.error("Nombre y valor de la variante son obligatorios");
      return;
    }
    const newVariant = {
      id: editingVariant?.id || `temp-${Date.now()}`,
      name: variantForm.name,
      value: variantForm.value,
      price: variantForm.price ? parseFloat(variantForm.price) : null,
      stock: variantForm.stock ? parseInt(variantForm.stock) : null,
    };

    if (editingVariant) {
      setVariants((prev) => prev.map((v) => (v.id === editingVariant.id ? newVariant : v)));
      setEditingVariant(null);
    } else {
      setVariants((prev) => [...prev, newVariant]);
    }
    setVariantForm({ name: "", value: "", price: "", stock: "" });
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantForm({
      name: variant.name || "",
      value: variant.value || "",
      price: variant.price ?? "",
      stock: variant.stock ?? "",
    });
  };

  const handleDeleteVariant = (variantId) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
    if (editingVariant?.id === variantId) {
      setEditingVariant(null);
      setVariantForm({ name: "", value: "", price: "", stock: "" });
    }
  };

  const onSubmit = (data) => saveMutation.mutate(data);

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isNew && isError) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle size={20} />
        <span>Error al cargar el producto: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/products")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isNew ? "Completa la informacion del producto" : `Editando producto #${id}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Informacion basica</h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                placeholder="Nombre del producto"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:ring-2 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/20"
                }`}
                {...register("name", { required: "El nombre es obligatorio" })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripcion</label>
              <textarea
                rows={4}
                placeholder="Descripcion detallada del producto"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                {...register("description")}
              />
            </div>

            {/* Short description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Descripcion corta
              </label>
              <input
                type="text"
                placeholder="Breve descripcion para listados"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                {...register("short_description")}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Precios</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Precio de venta
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:ring-2 ${
                  errors.price
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/20"
                }`}
                {...register("price", {
                  required: "El precio es obligatorio",
                  min: { value: 0, message: "El precio debe ser positivo" },
                })}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Precio comparacion
              </label>
              <input
                type="number"
                step="1"
                placeholder="Precio antes (opcional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                {...register("compare_at_price")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Precio de costo
              </label>
              <input
                type="number"
                step="1"
                placeholder="Costo (opcional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                {...register("cost_price")}
              />
            </div>
          </div>
        </div>

        {/* Inventory & IDs */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Inventario e identificadores</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
              <input
                type="text"
                placeholder="SKU del producto"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                {...register("sku")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                ID Producto Dropi
              </label>
              <input
                type="text"
                placeholder="ID en Dropi (opcional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                {...register("dropi_product_id")}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Etiquetas</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tags (separados por comas)
            </label>
            <input
              type="text"
              placeholder="ofertas, nuevo, popular"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              {...register("tags")}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Visibilidad</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                {...register("is_active")}
              />
              <span className="text-sm text-gray-700">Producto activo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                {...register("is_featured")}
              />
              <span className="text-sm text-gray-700">Producto destacado</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Imagenes</h2>

          {/* Current images */}
          {images.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <img
                    src={img.url}
                    alt="Producto"
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage || isNew}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
              {uploadingImage ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploadingImage ? "Subiendo..." : "Subir imagen"}
            </button>
            {isNew && (
              <p className="mt-2 text-xs text-gray-400">
                Guarda el producto primero para subir imagenes
              </p>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Variantes</h2>

          {/* Add variant form */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <input
              type="text"
              placeholder="Nombre (ej: Color)"
              value={variantForm.name}
              onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#4DBEA4]"
            />
            <input
              type="text"
              placeholder="Valor (ej: Rojo)"
              value={variantForm.value}
              onChange={(e) => setVariantForm({ ...variantForm, value: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#4DBEA4]"
            />
            <input
              type="number"
              placeholder="Precio"
              value={variantForm.price}
              onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#4DBEA4]"
            />
            <input
              type="number"
              placeholder="Stock"
              value={variantForm.stock}
              onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#4DBEA4]"
            />
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <Plus size={16} />
              {editingVariant ? "Actualizar" : "Agregar"}
            </button>
          </div>

          {editingVariant && (
            <button
              type="button"
              onClick={() => {
                setEditingVariant(null);
                setVariantForm({ name: "", value: "", price: "", stock: "" });
              }}
              className="mb-3 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar edicion
            </button>
          )}

          {/* Variants table */}
          {variants.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 font-medium text-gray-500">Nombre</th>
                  <th className="pb-2 font-medium text-gray-500">Valor</th>
                  <th className="pb-2 font-medium text-gray-500">Precio</th>
                  <th className="pb-2 font-medium text-gray-500">Stock</th>
                  <th className="pb-2 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="py-2 text-gray-900">{variant.name}</td>
                    <td className="py-2 text-gray-700">{variant.value}</td>
                    <td className="py-2 text-gray-700">
                      {variant.price != null ? formatCurrency(variant.price) : "---"}
                    </td>
                    <td className="py-2 text-gray-700">{variant.stock ?? "---"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditVariant(variant)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {variants.length === 0 && (
            <p className="text-sm text-gray-400">No hay variantes agregadas</p>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isLoading}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#4DBEA4" }}
          >
            {isSubmitting || saveMutation.isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isNew ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
