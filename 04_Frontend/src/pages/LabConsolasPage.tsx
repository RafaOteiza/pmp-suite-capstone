import React, { useEffect, useState } from "react";
import { getLabQueue, LabTicket } from "../api/lab"; 
import { useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { 
  Monitor, Wrench, RefreshCw, Search, User, Clock 
} from "lucide-react";
import RepairModal from "../components/RepairModal"; 

// --- CONSTANTES DE ESTADO ---
const STATE_DIAGNOSTICO = 4;
const STATE_REPARACION = 5;
const STATE_ESPERA_REPUESTO = 9;

const badgeStyle = (estadoId: number) => {
  if (estadoId === STATE_ESPERA_REPUESTO) {
    return {
        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
        backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444'
    };
  }
  const isReparacion = estadoId === STATE_REPARACION;
  const color = isReparacion ? '#10B981' : '#8B5CF6'; 
  return {
    padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
    backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40`, display: 'inline-block'
  };
};

export default function LabConsolasPage() {
  const [tickets, setTickets] = useState<LabTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTicket, setActiveTicket] = useState<LabTicket | null>(null); 
  
  const me = useOutletContext<Me | null>();
  const canWrite = can(me, PERMISSIONS.LAB_WRITE);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLabQueue('CONSOLA');
      setTickets(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t => 
    t.codigo_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.bus_ppu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="panel animate-fade-in">
      <ReadOnlyNotice me={me} />
      
      {/* --- MODAL INTELIGENTE --- */}
      {canWrite && activeTicket && (
        <RepairModal 
            os={activeTicket.codigo_os} 
            fallaReportada={activeTicket.falla} 
            initialState={activeTicket.estado_id}
            onClose={() => setActiveTicket(null)} 
            onSuccess={() => { setActiveTicket(null); load(); }} 
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 5 }}>Laboratorio · Consolas</h2>
          <p className="muted" style={{ margin: 0 }}>Diagnóstico y reparación de unidades centrales.</p>
        </div>
        <button onClick={load} className="btn ghost" disabled={loading} title="Actualizar">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid" style={{ gap: 20, marginBottom: 30, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #8B5CF6' }}>
            <div className="muted small">EN DIAGNÓSTICO</div>
            <div className="title" style={{fontSize: '2rem'}}>
                {tickets.filter(t => t.estado_id === STATE_DIAGNOSTICO).length}
            </div>
        </div>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #10B981' }}>
            <div className="muted small">EN REPARACIÓN</div>
            <div className="title" style={{fontSize: '2rem'}}>
                {tickets.filter(t => t.estado_id === STATE_REPARACION).length}
            </div>
        </div>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #EF4444' }}>
            <div className="muted small">ESPERA REPUESTO</div>
            <div className="title" style={{fontSize: '2rem'}}>
                {tickets.filter(t => t.estado_id === STATE_ESPERA_REPUESTO).length}
            </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <div className="input" style={{ padding: '0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{padding: '10px 12px', opacity: 0.5}}><Search size={18} /></div>
            <input 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '10px 0', color: 'inherit' }}
              placeholder="Buscar OS, Serie o PPU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filtered.map(t => {
            const esMio = me?.id === t.tecnico_laboratorio_id;

            // Determinar texto y color del botón único
            let btnText = "Gestionar Ticket";
            let btnColor = "#8B5CF6"; // Violeta por defecto
            
            if (t.estado_id === STATE_DIAGNOSTICO) {
                btnText = "Iniciar Diagnóstico";
                btnColor = "#8B5CF6"; 
            } else if (t.estado_id === STATE_REPARACION) {
                btnText = "Continuar Reparación";
                btnColor = "#10B981"; // Verde
            } else if (t.estado_id === STATE_ESPERA_REPUESTO) {
                btnText = "Ver Solicitud (En Espera)";
                btnColor = "#EF4444"; // Rojo
            }

            return (
            <div key={t.codigo_os} className="card" style={{ 
                padding: 20, display: 'flex', flexDirection: 'column', gap: 15,
                border: esMio ? '2px solid #10B981' : undefined,
                backgroundColor: esMio ? 'rgba(16, 185, 129, 0.05)' : undefined
            }}>
                <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                    <div style={{ 
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        backgroundColor: t.estado_id === STATE_REPARACION ? 'rgba(245, 158, 11, 0.1)' : (t.estado_id === 9 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: t.estado_id === STATE_REPARACION ? '#F59E0B' : (t.estado_id === 9 ? '#EF4444' : '#8B5CF6')
                    }}>
                        {t.estado_id === STATE_ESPERA_REPUESTO ? <Clock size={24}/> : (t.estado_id === STATE_REPARACION ? <Wrench size={24}/> : <Monitor size={24}/>)}
                    </div>
                    <div style={{flex: 1}}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.codigo_os}</span>
                            <span style={badgeStyle(t.estado_id)}>{t.estado_nombre}</span>
                        </div>
                        {esMio && (
                            <div style={{ 
                                fontSize: '0.7rem', fontWeight: 'bold', color: '#10B981', 
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                border: '1px solid #10B981', padding: '2px 8px', borderRadius: 4, marginBottom: 8
                            }}>
                                <User size={12}/> MI CARGA
                            </div>
                        )}
                        <div className="muted small">Serie: <strong style={{ color: 'var(--text-main)' }}>{t.serie}</strong></div>
                        <div className="muted small">Bus: <strong style={{ color: 'var(--text-main)' }}>{t.bus_ppu}</strong></div>
                        <div style={{ marginTop: 8, fontSize: '0.9rem', opacity: 0.8 }}>
                            <span style={{color: '#EF4444'}}>Falla:</span> {t.falla}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 15, borderTop: '1px solid var(--border-color)' }}>
                    
                    {/* BOTÓN ÚNICO QUE ABRE EL MODAL */}
                    {canWrite && (
                        <button 
                            className="btn"
                            onClick={() => setActiveTicket(t)} 
                            style={{ 
                                backgroundColor: btnColor, 
                                border: 'none', color: 'white', width: '100%', 
                                display: 'flex', justifyContent: 'center', gap: 8,
                                padding: 12, fontSize: '0.95rem'
                            }}
                        >
                            <Wrench size={18} /> {btnText}
                        </button>
                    )}

                </div>
            </div>
            );
        })}
      </div>
    </div>
  );
}
