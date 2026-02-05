import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const COUNTRIES = [
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "Mexico" },
  { code: "GT", name: "Guatemala" },
  { code: "PE", name: "Peru" },
  { code: "EC", name: "Ecuador" },
  { code: "CL", name: "Chile" },
];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { country: "CO" },
  });

  const onSubmit = async (data) => {
    try {
      const res = await client.post("/auth/register", {
        email: data.email,
        password: data.password,
        store_name: data.store_name,
        country: data.country,
      });
      localStorage.setItem("token", res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
      toast.success("Cuenta creada exitosamente");
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Error al crear la cuenta. Intenta de nuevo.";
      toast.error(msg);
    }
  };

  const inputClasses = (fieldError) =>
    `w-full rounded-lg border bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:ring-2 ${
      fieldError
        ? "border-red-500 focus:ring-red-500/30"
        : "border-white/10 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/30"
    }`;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#0D1717" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">MiniShop</h1>
          <p className="mt-2 text-gray-400 text-sm">
            Crea tu tienda online en minutos
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Correo electronico
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                className={inputClasses(errors.email)}
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Correo invalido",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimo 6 caracteres"
                  className={inputClasses(errors.password) + " pr-10"}
                  {...register("password", {
                    required: "La contrasena es obligatoria",
                    minLength: { value: 6, message: "Minimo 6 caracteres" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Store name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Nombre de tu tienda
              </label>
              <input
                type="text"
                placeholder="Mi tienda increible"
                className={inputClasses(errors.store_name)}
                {...register("store_name", {
                  required: "El nombre de la tienda es obligatorio",
                  minLength: { value: 3, message: "Minimo 3 caracteres" },
                })}
              />
              {errors.store_name && (
                <p className="mt-1 text-xs text-red-400">{errors.store_name.message}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Pais
              </label>
              <select
                className={inputClasses(errors.country)}
                {...register("country", { required: "Selecciona un pais" })}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-800 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-xs text-red-400">{errors.country.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#4DBEA4" }}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus size={18} />
              )}
              {isSubmitting ? "Creando cuenta..." : "Crear mi tienda"}
            </button>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="font-medium transition-colors hover:underline"
              style={{ color: "#4DBEA4" }}
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
