import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  Puzzle,
  Settings,
  Globe,
  Crosshair,
  BarChart3,
  Paintbrush,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const navSections = [
  {
    label: "Principal",
    items: [
      { to: "/", icon: LayoutDashboard, text: "Dashboard" },
      { to: "/products", icon: Package, text: "Productos" },
      { to: "/orders", icon: ShoppingCart, text: "Pedidos" },
      { to: "/designs", icon: Paintbrush, text: "Disenar tienda" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/abandoned-carts", icon: ShoppingBag, text: "Carritos abandonados" },
      { to: "/customers", icon: Users, text: "Clientes" },
    ],
  },
  {
    label: "Configuracion",
    items: [
      { to: "/checkout", icon: CreditCard, text: "Checkout" },
      { to: "/policies", icon: FileText, text: "Politicas" },
      { to: "/apps", icon: Puzzle, text: "Apps" },
      { to: "/settings", icon: Settings, text: "Ajustes" },
      { to: "/domain", icon: Globe, text: "Dominio" },
      { to: "/pixels", icon: Crosshair, text: "Pixeles" },
      { to: "/analytics", icon: BarChart3, text: "Analiticas" },
    ],
  },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
    isActive
      ? "bg-white/10 text-white font-medium"
      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
  }`;

export default function BuilderLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col justify-between shrink-0 overflow-y-auto"
        style={{ width: 240, backgroundColor: "#0D1717" }}
      >
        {/* Top: logo area */}
        <div>
          <div className="px-5 py-5">
            <span className="text-white text-lg font-bold tracking-tight">
              MiniShop
            </span>
          </div>

          {/* Nav sections */}
          <nav className="flex flex-col gap-6 px-3 mt-2">
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <NavLink to={item.to} end={item.to === "/"} className={linkClass}>
                        <item.icon size={18} />
                        {item.text}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="px-3 pb-5 flex flex-col gap-2">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#4DBEA4" }}
          >
            <ExternalLink size={16} />
            Ver mi tienda
          </a>
          <a
            href="https://estrategasia.com"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Estrategas IA
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
