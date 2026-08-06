import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Me } from "../api/me";
import { getLabQueue, getLabTechnicians, assignTicket, LabTicket, LabTech } from "../api/lab";
import { RefreshCw, User, Cpu, Monitor, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { can, PERMISSIONS } from "../app/rbac";
import { getApiErrorMessage } from "../api/errors";

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color, #374151)',
  backgroundColor: 'var(--bg-input, #111827)',
  color: 'var(--text-main, white)',
  outline: 'none',
  fontSize: '0.9rem',
  cursor: 'pointer',
  width: '100%',
  minWidth: '200px'
};

export default function LabAsignacionPage() {
  const me = useOutletContext<Me | null>();
  const canAssign = can(me, PERMISSIONS.LAB_ASSIGN);
  const [tickets, setTickets] = useState<LabTicket[]>([]);
  const [techs, setTechs] = useState<LabTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estado para la notificación (Toast)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      try {
        const tecnicos = await getLabTechnicians();
        setTechs(tecnicos);
      } catch (e) {
        console.error("Error cargando técnicos:", e);
        setErrorMsg("No se pudo cargar la lista de técnicos.");
      }

      try {
        const [val, con] = await Promise.all([
            getLabQueue('VALIDADOR'),
            getLabQueue('CONSOLA')
        ]);
        const sorted = [...val, ...con].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        setTickets(sorted);
      } catch (e) {
        console.error("Error cargando OS:", e);
        setErrorMsg("Error cargando las Órdenes de Servicio.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Efecto para ocultar la notificación automáticamente a los 3 segundos
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAssign = async (os: string, techId: string) => {
    if (!canAssign) return;
    setChanging(os);
    try {
      await assignTicket(os, techId);
      
      // Actualizamos UI
      setTickets(prev => prev.map(t => 
        t.codigo_os === os ? { ...t, tecnico_laboratorio_id: techId } : t
      ));

      // 🔔 MOSTRAR TOAST DE ÉXITO
      // Buscamos el nombre del técnico para que el mensaje sea más pro
      const techName = techs.find(t => t.id === techId)?.nombre || "Técnico";
      const mensaje = techId ? `Asignado a ${techName} correctamente.` : "Asignación eliminada.";
      
      setNotification({ message: mensaje, type: 'success' });

    } catch (error: any) {
      console.error("Error asignando:", error);
      const serverMsg = getApiErrorMessage(error, "Error de conexión");
      
      // 🔔 MOSTRAR TOAST DE ERROR
      setNotification({ message: `Error: ${serverMsg}`, type: 'error' });
    } finally {
      setChanging(null);
    }
  };

  return (
    <div className="panel animate-fade-in" style={{ position: 'relative' }}>
      
      {/* --- TOAST NOTIFICATION (FLOTANTE) --- */}
      {notification && (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out',
            fontWeight: 500
        }}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 5 }}>Gestión de Carga</h2>
          <p className="muted" style={{ margin: 0 }}>Distribuye las órdenes de servicio a los técnicos.</p>
        </div>
        <button onClick={loadData} className="btn ghost" disabled={loading} title="Recargar datos">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: 15, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: 8, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertTriangle size={20} /> {errorMsg}
        </div>
      )}

      {/* STATS */}
      <div className="grid" style={{ gap: 20, marginBottom: 30, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #3B82F6' }}>
            <div className="muted small">TICKETS EN TALLER</div>
            <div className="title" style={{fontSize: '2rem'}}>{tickets.length}</div>
        </div>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #F59E0B' }}>
            <div className="muted small">SIN ASIGNAR</div>
            <div className="title" style={{fontSize: '2rem'}}>
                {tickets.filter(t => !t.tecnico_laboratorio_id).length}
            </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                  <tr style={{ backgroundColor: 'rgba(128,128,128,0.05)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: 15 }}>Ticket</th>
                      <th style={{ padding: 15 }}>Equipo</th>
                      <th style={{ padding: 15 }}>Falla Reportada</th>
                      <th style={{ padding: 15, width: 280 }}>Asignado a</th>
                      <th style={{ padding: 15, width: 50 }}></th>
                  </tr>
              </thead>
              <tbody>
                  {tickets.length === 0 && !loading && (
                      <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center' }} className="muted">No hay equipos pendientes en laboratorio.</td></tr>
                  )}

                  {tickets.map(t => (
                      <tr key={t.codigo_os} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: 15 }}>
                              <span style={{ fontWeight: 'bold' }}>{t.codigo_os}</span>
                              <div className="small muted" style={{marginTop: 4}}>
                                {new Date(t.fecha).toLocaleDateString()}
                              </div>
                          </td>
                          <td style={{ padding: 15 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {t.codigo_os.startsWith('MV') || t.codigo_os.startsWith('PDV') ? 
                                      <Cpu size={16} color="#10B981"/> : <Monitor size={16} color="#3B82F6"/>
                                  }
                                  <span style={{ fontWeight: 500 }}>{t.serie}</span>
                              </div>
                              <div className="small muted" style={{marginTop: 4}}>Bus: {t.bus_ppu}</div>
                          </td>
                          <td style={{ padding: 15, maxWidth: 250, opacity: 0.9 }}>
                              {t.falla}
                          </td>
                          <td style={{ padding: 15 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ padding: 8, borderRadius: '50%', background: 'rgba(128,128,128,0.1)' }}>
                                    <User size={16} className="muted" />
                                  </div>
                                  {canAssign ? <select 
                                      style={selectStyle}
                                      value={t.tecnico_laboratorio_id || ""}
                                      onChange={(e) => handleAssign(t.codigo_os, e.target.value)}
                                      disabled={changing === t.codigo_os}
                                  >
                                      <option value="">-- Sin Asignar --</option>
                                      {techs.map(tech => (
                                          <option key={tech.id} value={tech.id}>
                                              {tech.nombre} {tech.apellido}
                                          </option>
                                      ))}
                                  </select> : <span>{t.tecnico_laboratorio || "Sin asignar"}</span>}
                              </div>
                          </td>
                          <td style={{ padding: 15, textAlign: 'center' }}>
                              {changing === t.codigo_os ? 
                                <RefreshCw size={18} className="animate-spin muted"/> : 
                                (t.tecnico_laboratorio_id && <Check size={20} color="#10B981"/>)
                              }
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </div>

      {/* Animación simple para el Toast */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
