import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Loader2,
  Check,
} from "lucide-react";

export default function TopBar({
  title,
  onTitleChange,
  saveStatus,
  onSave,
  onPublish,
  device,
  onDeviceChange,
  theme,
  onThemeToggle,
  saving,
  publishing,
}) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title || "");
  const inputRef = useRef(null);

  useEffect(() => {
    setEditTitle(title || "");
  }, [title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleTitleSubmit = () => {
    setEditing(false);
    if (editTitle.trim() && editTitle !== title) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title || "");
    }
  };

  const statusInfo = {
    saved: { text: "Guardado", color: "#4DBEA4", Icon: Check },
    unsaved: { text: "Sin guardar", color: "#f59e0b", Icon: null },
    saving: { text: "Guardando...", color: "#888", Icon: Loader2 },
  }[saveStatus] || { text: "", color: "#888", Icon: null };

  const devices = [
    { name: "Escritorio", icon: Monitor },
    { name: "Tablet", icon: Tablet },
    { name: "Celular", icon: Smartphone },
  ];

  return (
    <div className="designer-topbar">
      {/* Left section */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="topbar-btn-ghost" onClick={() => navigate("/designs")}>
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="topbar-divider" />

        {editing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
            className="topbar-title-input"
          />
        ) : (
          <span
            className="topbar-title"
            onClick={() => setEditing(true)}
            title="Clic para editar"
          >
            {title || "Sin titulo"}
          </span>
        )}

        <span className="topbar-status" style={{ color: statusInfo.color }}>
          {statusInfo.Icon && (
            <statusInfo.Icon
              size={12}
              className={saveStatus === "saving" ? "animate-spin" : ""}
            />
          )}
          {statusInfo.text}
        </span>
      </div>

      {/* Right section */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="topbar-device-group">
          {devices.map((d) => (
            <button
              key={d.name}
              onClick={() => onDeviceChange(d.name)}
              className={`topbar-device-btn ${device === d.name ? "active" : ""}`}
              title={d.name}
            >
              <d.icon size={14} />
            </button>
          ))}
        </div>

        <button
          className="topbar-btn-ghost"
          onClick={onThemeToggle}
          title={theme === "night" ? "Modo dia" : "Modo noche"}
        >
          {theme === "night" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="topbar-divider" />

        <button className="topbar-btn-secondary" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Guardar
        </button>
        <button className="topbar-btn-primary" onClick={onPublish} disabled={publishing}>
          {publishing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          Publicar
        </button>
      </div>
    </div>
  );
}
