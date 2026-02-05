import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await client.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("token", res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
      toast.success("Inicio de sesion exitoso");
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Credenciales incorrectas. Intenta de nuevo.";
      toast.error(msg);
    }
  };

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
            Inicia sesion en tu panel de administracion
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
                className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-white/10 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/30"
                }`}
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-10 text-white placeholder-gray-500 outline-none transition-colors focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-white/10 focus:border-[#4DBEA4] focus:ring-[#4DBEA4]/30"
                  }`}
                  {...register("password", {
                    required: "La contrasena es obligatoria",
                    minLength: {
                      value: 6,
                      message: "Minimo 6 caracteres",
                    },
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
                <LogIn size={18} />
              )}
              {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
            </button>
          </form>

          {/* Link to register */}
          <p className="mt-6 text-center text-sm text-gray-400">
            No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="font-medium transition-colors hover:underline"
              style={{ color: "#4DBEA4" }}
            >
              Registrate aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
