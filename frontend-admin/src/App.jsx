import { Routes, Route, Navigate } from "react-router-dom";
import BuilderLayout from "./layouts/BuilderLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductEdit from "./pages/ProductEdit";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AbandonedCarts from "./pages/AbandonedCarts";
import Customers from "./pages/Customers";
import Checkout from "./pages/Checkout";
import Policies from "./pages/Policies";
import Apps from "./pages/Apps";
import Settings from "./pages/Settings";
import Domain from "./pages/Domain";
import Pixels from "./pages/Pixels";
import Analytics from "./pages/Analytics";
import PageDesigns from "./pages/PageDesigns";
import PageDesigner from "./pages/PageDesigner";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes wrapped in BuilderLayout */}
      <Route
        element={
          <ProtectedRoute>
            <BuilderLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductEdit />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/abandoned-carts" element={<AbandonedCarts />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/domain" element={<Domain />} />
        <Route path="/pixels" element={<Pixels />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/designs" element={<PageDesigns />} />
      </Route>

      {/* Full-screen routes (outside BuilderLayout) */}
      <Route
        path="/designer/:id"
        element={
          <ProtectedRoute>
            <PageDesigner />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
