import React, { useEffect, useMemo, useState } from "react";
import {
  ALLOWED_ROLES,
  AdminUser,
  adminCreateUser,
  adminListUsers,
  adminResetPasswordLink,
  adminSetPassword,
  adminUpdateUser
} from "../api/adminUsers";
import { 
  UserPlus, Search, Edit2, Shield, 
  CheckCircle, XCircle, Mail, Lock, User, 
  RefreshCw, AlertTriangle, Key, Copy, X, 
  ChevronLeft, ChevronRight 
} from "lucide-react"; 

// --- ESTILOS DE LAYOUT (Sin colores forzados) ---
// Usamos solo propiedades de estructura. Los colores vendrán de las clases CSS (card, input, etc.)

const labelWithIconStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '6px',
  fontWeight: 500
};

// Badges con colores RGBA que funcionan bien sobre blanco y sobre negro
const badgeStyle = (isActive: boolean) => ({
  padding: '4px 10px',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase' as 'uppercase',
  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
  color: isActive ? '#10B981' : '#EF4444',
  border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
});

const roleBadgeStyle = {
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  color: '#3B82F6', // Azul vibrante (se lee bien en ambos modos)
  border: '1px solid rgba(59, 130, 246, 0.2)'
};

// ----------------------------------------------------

type NotificationType = {
  message: string;
  type: "success" | "error";
} | null;

function friendlyError(err: any, fallback: string): string {
  const raw = err?.response?.data?.error ?? err?.response?.data?.detail ?? err?.message ?? fallback;
  if (typeof raw !== "string") return fallback;
  const lower = raw.toLowerCase();
  if (lower.includes("transaction") || lower.includes("postgres") || lower.includes("25p02")) {
    return "Error al actualizar el usuario. Reintenta. Si persiste, contacta soporte.";
  }
  return raw;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [notification, setNotification] = useState<NotificationType>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const notify = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- ESTADOS ---
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rolCrear, setRolCrear] = useState<string>(ALLOWED_ROLES[0]);
  const [createPassword, setCreatePassword] = useState("");

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editCorreo, setEditCorreo] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editRol, setEditRol] = useState<string>(ALLOWED_ROLES[0]);
  const [editActivo, setEditActivo] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [resetResult, setResetResult] = useState<{ correo: string; link: string } | null>(null);

  // LOGICA DE DATOS
  const processedUsers = useMemo(() => {
    let list = Array.isArray(users) ? [...users] : [];
    if (searchTerm) {
        list = list.filter(u => 
            (u.nombre + " " + u.apellido).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email ?? u.correo ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.rol ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    list.sort((a, b) => (a.apellido || "").localeCompare(b.apellido || ""));
    return list;
  }, [users, searchTerm]);

  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const displayedUsers = processedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const load = async () => {
    setBusy(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch (ex: any) {
      notify(friendlyError(ex, "Error listando usuarios"), "error");
      setUsers([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setBusy(true);
    try {
      await adminCreateUser({
        email: email.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rol: rolCrear,
        password: createPassword.trim() || undefined 
      });
      setEmail(""); setNombre(""); setApellido(""); setCreatePassword("");
      setRolCrear(ALLOWED_ROLES[0]);
      notify("¡Usuario creado exitosamente!", "success");
      await load();
    } catch (ex: any) {
      notify(friendlyError(ex, "Error creando usuario"), "error");
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (u: AdminUser) => {
    setNotification(null); setResetResult(null); setNewPassword(""); setNewPassword2("");
    setEditing(u);
    setEditCorreo(u.correo ?? u.email ?? "");
    setEditNombre(u.nombre ?? "");
    setEditApellido(u.apellido ?? "");
    setEditRol(u.rol ?? u.roles?.[0] ?? ALLOWED_ROLES[0]);
    setEditActivo(u.activo !== undefined ? u.activo : true);
  };

  const closeEdit = () => {
    setEditing(null);
    setResetResult(null);
    setNewPassword("");
    setNewPassword2("");
  };

  const saveEdit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const payload: Partial<AdminUser> = {};
      if (editCorreo.trim() !== (editing.correo ?? editing.email)) payload.correo = editCorreo.trim();
      if (editNombre.trim() !== editing.nombre) payload.nombre = editNombre.trim();
      if (editApellido.trim() !== (editing.apellido ?? "")) payload.apellido = editApellido.trim();
      if (editRol.trim() !== (editing.rol ?? editing.roles?.[0])) payload.rol = editRol.trim();
      if (editActivo !== editing.activo) payload.activo = editActivo;

      if (Object.keys(payload).length > 0) {
        await adminUpdateUser(editing.id, payload);
        notify("¡Usuario actualizado correctamente!", "success");
        await load();
      }
      closeEdit();
    } catch (ex: any) {
      notify(friendlyError(ex, "Error actualizando usuario"), "error");
    } finally {
      setBusy(false);
    }
  };

  const doSetPassword = async () => {
    if (!editing) return;
    if (!newPassword || newPassword !== newPassword2) return notify("Las contraseñas no coinciden", "error");
    setBusy(true);
    try {
      await adminSetPassword(editing.id, newPassword);
      setNewPassword(""); setNewPassword2("");
      notify("Contraseña actualizada correctamente", "success");
    } catch (ex: any) {
      notify(friendlyError(ex, "Error cambiando contraseña"), "error");
    } finally { setBusy(false); }
  };

  const doResetPasswordLink = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const res = await adminResetPasswordLink(editing.id);
      setResetResult(res);
      notify("Link generado correctamente", "success");
    } catch (ex: any) {
      notify(friendlyError(ex, "Error generando link"), "error");
    } finally { setBusy(false); }
  };

  const copyResetLink = async () => {
    if (!resetResult?.link) return;
    try { await navigator.clipboard.writeText(resetResult.link); notify("Copiado", "success"); } catch {}
  };

  const fullName = (u: AdminUser) => `${u.apellido ?? ""}, ${u.nombre ?? ""}`.trim();

  return (
    <div className="panel animate-fade-in">
      
      {notification && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, minWidth: "300px", backgroundColor: notification.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "16px 20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: "500" }}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", marginLeft: "10px" }}><X size={18} /></button>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 5 }}>Administración de Usuarios</h2>
          <p className="muted" style={{ margin: 0 }}>Gestión de accesos y roles del sistema.</p>
        </div>
        <button onClick={load} className="btn ghost" disabled={busy} title="Refrescar datos">
            <RefreshCw size={20} className={busy ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- FORMULARIO DE CREACIÓN --- */}
      {/* Usamos className="card" para que tome el color de fondo correcto (blanco o negro) según el tema */}
      <div className="card" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20}}>
            <div style={{background: 'rgba(245, 158, 11, 0.1)', padding: 8, borderRadius: 8}}>
                <UserPlus size={20} color="#F59E0B"/>
            </div>
            {/* Quitamos color hardcoded, usamos clase CSS implícita del tema */}
            <h3 style={{margin: 0, fontSize: '1.1rem'}}>Crear Nuevo Usuario</h3>
        </div>

        <form onSubmit={create} autoComplete="off" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end'}}>
            
            <div>
                <label className="small muted" style={labelWithIconStyle}><Mail size={14} /> Email</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@pmp-suite.cl" autoComplete="off" name="new_user_email" />
            </div>

            <div>
                <label className="small muted" style={labelWithIconStyle}><User size={14} /> Nombre</label>
                <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" autoComplete="off" name="new_user_name" />
            </div>

            <div>
                <label className="small muted" style={labelWithIconStyle}><User size={14} /> Apellido</label>
                <input className="input" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" autoComplete="off" name="new_user_surname" />
            </div>

            <div>
                <label className="small muted" style={labelWithIconStyle}><Shield size={14} /> Rol</label>
                <select className="input" value={rolCrear} onChange={(e) => setRolCrear(e.target.value)}>
                    {ALLOWED_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div>
                <label className="small muted" style={labelWithIconStyle}><Lock size={14} /> Contraseña (Opcional)</label>
                <input className="input" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="••••••" autoComplete="new-password" />
            </div>

            <button className="btn" disabled={busy || !email.trim() || !nombre.trim() || !apellido.trim()} style={{height: '42px', backgroundColor: '#F59E0B', border: 'none', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 'auto'}}>
                {busy ? "Procesando..." : <><UserPlus size={18}/> Crear</>}
            </button>
        </form>
      </div>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        {/* Envolvimos el input en un div con clase "input" para que adopte el estilo de input (borde, fondo) del tema */}
        <div className="input" style={{ padding: '0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{padding: '10px 12px', opacity: 0.5}}><Search size={18} /></div>
            <input 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '10px 0', color: 'inherit' }}
              placeholder="Buscar por nombre, correo o rol..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* --- TABLA DE USUARIOS --- */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                {/* Cabecera con fondo sutil para contraste en Light/Dark */}
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', textAlign: 'left', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                    <th style={{ padding: '16px', opacity: 0.7, fontWeight: 600 }}>USUARIO</th>
                    <th style={{ padding: '16px', opacity: 0.7, fontWeight: 600 }}>CORREO</th>
                    <th style={{ padding: '16px', opacity: 0.7, fontWeight: 600 }}>ROL</th>
                    <th style={{ padding: '16px', opacity: 0.7, fontWeight: 600 }}>ESTADO</th>
                    <th style={{ padding: '16px', textAlign: 'right', opacity: 0.7, fontWeight: 600 }}>ACCIONES</th>
                </tr>
                </thead>
                <tbody>
                {displayedUsers.length === 0 ? (
                    <tr><td colSpan={5} style={{padding: '40px', textAlign: 'center', opacity: 0.5}}>No se encontraron usuarios.</td></tr>
                ) : (
                    displayedUsers.map((u) => (
                        <tr key={u.id} 
                            style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)', transition: 'background 0.2s' }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.05)'} 
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '16px' }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                    {/* Avatar circular con fondo adaptativo */}
                                    <div style={{width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B'}}>
                                        <User size={16} />
                                    </div>
                                    <span style={{fontWeight: 500}}>{fullName(u)}</span>
                                </div>
                            </td>
                            <td style={{ padding: '16px', opacity: 0.8 }}>{u.email ?? u.correo}</td>
                            <td style={{ padding: '16px' }}>
                                <span style={roleBadgeStyle}>{u.rol}</span>
                            </td>
                            <td style={{ padding: '16px' }}>
                                <span style={badgeStyle(!!u.activo)}>
                                    {u.activo ? "ACTIVO" : "INACTIVO"}
                                </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: "right" }}>
                                <button className="btn ghost" disabled={busy} onClick={() => openEdit(u)} title="Editar" style={{padding: 8}}>
                                    <Edit2 size={18} style={{ opacity: 0.6 }} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
        
        {/* PAGINACIÓN FOOTER */}
        {totalPages > 1 && (
            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    Página {currentPage} de {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        className="btn ghost"
                        style={{ padding: '6px 10px', opacity: currentPage === 1 ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                        className="btn ghost"
                        style={{ padding: '6px 10px', opacity: currentPage === totalPages ? 0.3 : 1 }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }} onClick={closeEdit}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Editar Usuario</h3>
              <button onClick={closeEdit} className="btn ghost" style={{ padding: 4 }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: 15 }}>
                <label className="small muted" style={labelWithIconStyle}><Mail size={14}/> Email</label>
                <input className="input" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                <div>
                    <label className="small muted" style={labelWithIconStyle}><User size={14}/> Nombre</label>
                    <input className="input" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                </div>
                <div>
                    <label className="small muted" style={labelWithIconStyle}><User size={14}/> Apellido</label>
                    <input className="input" value={editApellido} onChange={(e) => setEditApellido(e.target.value)} />
                </div>
            </div>

            <div style={{ marginBottom: 15 }}>
                <label className="small muted" style={labelWithIconStyle}><Shield size={14}/> Rol</label>
                <select className="input" value={editRol} onChange={(e) => setEditRol(e.target.value)}>
                    {ALLOWED_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Checkbox con estilo adaptativo */}
            <div className="input" style={{ display: "flex", gap: 10, alignItems: "center", padding: '12px', marginBottom: 20 }}>
              <input type="checkbox" checked={editActivo} onChange={(e) => setEditActivo(e.target.checked)} style={{ width: 18, height: 18 }} />
              <span className="small muted" style={{margin: 0}}>Usuario Activo (Permitir acceso)</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color, #e5e7eb)', margin: '20px 0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15, color: '#F59E0B' }}>
                <AlertTriangle size={18} /> 
                <span style={{ fontWeight: 600 }}>Zona de Seguridad</span>
              </div>
              
              {/* Contenedor gris/adaptativo para seguridad */}
              <div style={{ backgroundColor: 'rgba(128,128,128,0.05)', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                  <label className="small muted" style={labelWithIconStyle}>Cambio Manual de Contraseña</label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
                    <div style={{flex: 1}}>
                        <input className="input" type="password" placeholder="Nueva pass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div style={{flex: 1}}>
                        <input className="input" type="password" placeholder="Confirmar" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} autoComplete="new-password" />
                    </div>
                  </div>
                  <button onClick={doSetPassword} disabled={busy || !newPassword} className="btn ghost" style={{ width: '100%', marginTop: 10, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                    <Key size={14} /> Actualizar Contraseña
                  </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={doResetPasswordLink} className="btn ghost" disabled={busy} style={{ fontSize: '0.8rem', opacity: 0.7 }}>Generar Link de Reset</button>
              </div>

              {resetResult && (
                <div style={{ marginTop: 10, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: 10, borderRadius: 6, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{color: '#10B981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 10}}>
                    Link: {resetResult.link}
                  </div>
                  <button onClick={copyResetLink} className="btn ghost" style={{padding: 4}} title="Copiar"><Copy size={16} color="#10B981"/></button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button className="btn ghost" onClick={closeEdit} disabled={busy}>Cancelar</button>
              <button className="btn" onClick={saveEdit} disabled={busy || !editNombre.trim()} style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none' }}>
                {busy ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}