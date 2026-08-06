import React, { useEffect, useState, useRef } from "react";
import { getLabQueue, LabTicket } from "../api/lab";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { calculateSLA } from "../utils/sla";
import { useAlert } from "../hooks/useAlert";
import CustomModal from "../components/CustomModal";
import { 
  Activity, Clock, AlertTriangle, CheckCircle, 
  Cpu, Monitor, ArrowRight, RefreshCw, Bell 
} from "lucide-react";

export default function LabDashboardPage() {
  const [tickets, setTickets] = useState<LabTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { modal, showAlert, closeAlert } = useAlert();
  const me = useOutletContext<Me | null>();
  const showAll = can(me, PERMISSIONS.REPORTS_VIEW);
  const navigate = useNavigate();
  
  // Referencia para comparar cantidad anterior
  const prevCountRef = useRef(0);

  // 1. SOLICITAR PERMISO DE NOTIFICACIONES AL CARGAR
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Función para disparar la alerta (Sonido + Popup)
  const triggerNotification = () => {
    // A. Reproducir Sonido
    try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(e => console.log("Audio bloqueado hasta interacción del usuario"));
    } catch (e) { console.error(e); }

    // B. Mostrar Notificación de Escritorio
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("PMP Suite - Laboratorio", {
            body: "🔔 ¡Atención! Tienes una nueva Orden de Servicio asignada.",
            icon: "/vite.svg", 
            requireInteraction: true 
        });
    } else {
        // Fallback si no dio permiso: Usar nuestro modal premium
        showAlert('info', 'Nueva Carga', '🔔 ¡Atención! Tienes una nueva Orden de Servicio asignada en tu bandeja.');
    }
  };

  const load = async () => {
    // Solo mostramos spinner la primera vez para no interrumpir visualmente
    if (tickets.length === 0) setLoading(true);
    
    try {
      const [val, con] = await Promise.all([
          getLabQueue('VALIDADOR'),
          getLabQueue('CONSOLA')
      ]);
      
      const todos = [...val, ...con];
      
      const misTickets = showAll ? todos : todos.filter(t => t.tecnico_laboratorio_id === me?.id);
      
      misTickets.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      
      // --- DETECTOR DE CAMBIOS ---
      if (prevCountRef.current > 0 && misTickets.length > prevCountRef.current) {
          triggerNotification();
      }
      
      prevCountRef.current = misTickets.length;
      setTickets(misTickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
      load(); 
      const interval = setInterval(load, 15000);
      return () => clearInterval(interval);
  }, []);

  const total = tickets.length;
  const enDiagnostico = tickets.filter(t => t.estado_id === 4).length;
  const enReparacion = tickets.filter(t => t.estado_id === 5).length;
  const criticos = tickets.filter(t => {
      const sla = calculateSLA(t.fecha);
      return sla.critico || sla.vencido;
  });

  return (
    <>
      <CustomModal 
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={closeAlert}
          onCancel={closeAlert}
      />
    <div className="panel animate-fade-in">
      <ReadOnlyNotice me={me} />
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
            <h2 className="title">Hola, {me?.nombre} 👋</h2>
            <p className="muted">
                {showAll
                    ? "Resumen de carga global del laboratorio."
                    : "Resumen de tu carga de trabajo asignada."}
            </p>
        </div>
        <div style={{display:'flex', gap: 10}}>
            {/* Botón para probar notificación manualmente */}
            <button onClick={triggerNotification} className="btn ghost" title="Probar Sonido">
                <Bell size={20} />
            </button>
            <button onClick={load} className="btn ghost" disabled={loading}>
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* CARDS KPI */}
      <div className="grid" style={{ gap: 20, marginBottom: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #3B82F6' }}>
            <div>
                <div className="muted small" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>TOTAL ASIGNADOS</div>
                <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{total}</div>
                <div className="small muted" style={{ marginTop: '8px' }}>Equipos en bandeja</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px' }}>
                <Activity color="#3B82F6" size={28} />
            </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #EF4444' }}>
            <div>
                <div className="muted small" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>SLA CRÍTICO / VENCIDO</div>
                <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1, color: criticos.length > 0 ? '#EF4444' : 'inherit' }}>
                    {criticos.length}
                </div>
                <div className="small muted" style={{ marginTop: '8px' }}>Atención prioritaria</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '14px' }}>
                <AlertTriangle color="#EF4444" size={28} />
            </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #F59E0B' }}>
            <div className="muted small" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '10px' }}>ESTADO DE AVANCE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span>🔬 Diagnóstico</span>
                <strong>{enDiagnostico}</strong>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: total ? `${(enDiagnostico/total)*100}%` : '0%', background: '#3B82F6', height: '100%', transition: 'width 0.5s' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 12, marginBottom: 4 }}>
                <span>🛠️ Reparación</span>
                <strong>{enReparacion}</strong>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: total ? `${(enReparacion/total)*100}%` : '0%', background: '#F59E0B', height: '100%', transition: 'width 0.5s' }}></div>
            </div>
        </div>
      </div>

      <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: 15 }}>Prioridad Alta (Ordenado por SLA)</h3>
      
      {total === 0 && !loading && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 10px' }} />
              <p className="muted">¡Excelente! No tienes tareas pendientes.</p>
          </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {tickets.slice(0, 5).map(t => { 
            const sla = calculateSLA(t.fecha);
            const isValidador = t.codigo_os.startsWith('MV') || t.codigo_os.startsWith('PDV');

            return (
                <div key={t.codigo_os} className="card animate-fade-in" style={{ 
                    padding: '16px 24px', 
                    display: 'flex', alignItems: 'center', gap: 20, 
                    border: sla.vencido ? '1px solid #EF4444' : undefined,
                    backgroundColor: sla.vencido ? 'rgba(239, 68, 68, 0.05)' : undefined,
                    borderLeft: t.codigo_os === tickets[0].codigo_os ? '4px solid #3B82F6' : undefined
                }}>
                    <div style={{ 
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: isValidador ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {isValidador ? <Cpu size={22} color="#10B981"/> : <Monitor size={22} color="#3B82F6"/>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                             <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{t.codigo_os}</span>
                             <span className="badge" style={{ fontSize: '0.7rem' }}>
                                {t.estado_id === 4 ? 'DIAGNÓSTICO' : 'REPARACIÓN'}
                             </span>
                        </div>
                        <div className="small muted" style={{ marginTop: 2 }}>{t.falla}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                        <div style={{ 
                            fontWeight: 'bold', 
                            color: sla.vencido ? '#EF4444' : (sla.critico ? '#F59E0B' : '#10B981'),
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5
                        }}>
                            <Clock size={16} />
                            {sla.texto}
                        </div>
                        <div className="small muted">Tiempo restante</div>
                    </div>
                    <button 
                        onClick={() => navigate(isValidador ? '/lab/validadores' : '/lab/consolas')}
                        className="btn ghost" 
                        style={{ padding: 10 }}
                        title="Gestionar equipo"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            );
        })}
      </div>
    </div>
    </>
  );
}
