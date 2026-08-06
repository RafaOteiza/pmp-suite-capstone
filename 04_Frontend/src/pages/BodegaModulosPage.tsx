import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Me } from "../api/me";
import {
    getBodegaStock,
    BodegaTicket,
    StockData,
    TecnicoTerreno,
    getTecnicosTerreno,
    asignarEquipo
} from "../api/bodega";
import { useAlert } from "../hooks/useAlert";
import CustomModal from "../components/CustomModal";
import {
    RefreshCw,
    CheckCircle,
    Monitor,
    Cpu,
    BoxSelect,
    UserPlus,
    X,
    Archive,
    AlertTriangle
} from "lucide-react";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { getApiErrorMessage } from "../api/errors";

export default function BodegaModulosPage() {
    const me = useOutletContext<Me | null>();
    const canWrite = can(me, PERMISSIONS.BODEGA_WRITE);
    const [stock, setStock] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { modal, showAlert, showConfirm, closeAlert } = useAlert();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Assignment State
    const [tecnicos, setTecnicos] = useState<TecnicoTerreno[]>([]);
    const [assigningTicket, setAssigningTicket] = useState<BodegaTicket | null>(null);
    const [assignForm, setAssignForm] = useState({ tecnico_id: '', bus_ppu: '' });

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [stockData, tecs] = await Promise.all([
                getBodegaStock(),
                getTecnicosTerreno()
            ]);
            setStock(stockData);
            setTecnicos(tecs);
        } catch (err) {
            console.error(err);
            setError("Error cargando módulos de bodega.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Auto-hide alerts
    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => { setSuccess(""); setError(""); }, 3500);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    const submitAssign = async () => {
        if (!canWrite) {
            showAlert('error', 'Acceso Denegado', 'Solo el personal de logística puede asignar equipos a terreno.');
            return;
        }
        if (!assigningTicket || !assignForm.tecnico_id || !assignForm.bus_ppu) {
            showAlert('error', 'Campos Incompletos', 'Completa todos los campos (Técnico y PPU).');
            return;
        }
        setProcessing(assigningTicket.codigo_os);
        try {
            await asignarEquipo(assigningTicket.codigo_os, assignForm.tecnico_id, assignForm.bus_ppu);
            setSuccess(`Equipo ${assigningTicket.codigo_os} asignado exitosamente.`);
            setAssigningTicket(null);
            setAssignForm({tecnico_id: '', bus_ppu: ''});
            await loadData();
            showAlert('success', 'Asignación Exitosa', `El equipo ${assigningTicket.codigo_os} ha sido enviado a terreno.`);
        } catch (err: any) {
            showAlert('error', 'Error de Asignación', getApiErrorMessage(err, "No se pudo procesar la asignación."));
        } finally {
            setProcessing(null);
        }
    };

    return (
        <>
            <CustomModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={closeAlert}
                confirmText={modal.confirmText}
            />
            {/* MODAL DE ASIGNACIÓN */}
            {canWrite && assigningTicket && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                    <div className="panel" style={{ width: '450px', position: 'relative' }}>
                        <button className="btn ghost" style={{ position: 'absolute', top: 15, right: 15 }} onClick={() => setAssigningTicket(null)}>
                            <X size={20} />
                        </button>
                        <h3 className="title" style={{ marginBottom: 20 }}>Asignar Equipo a Terreno</h3>
                        <div style={{ marginBottom: 20, padding: 15, backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 8 }}>
                            <strong style={{ display: 'block', fontSize: '1.2rem', color: '#8B5CF6' }}>{assigningTicket.codigo_os}</strong>
                            <div className="small muted">{assigningTicket.tipo_equipo} | Serie: {assigningTicket.serie}</div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label className="label">Técnico de Terreno Destino</label>
                            <select 
                                className="input" 
                                value={assignForm.tecnico_id} 
                                onChange={e => setAssignForm({...assignForm, tecnico_id: e.target.value})}
                            >
                                <option value="">Seleccione un técnico...</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 25 }}>
                            <label className="label">Placa Patente (PPU) del Bus a instalar</label>
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="Ej: BLGH-28" 
                                value={assignForm.bus_ppu} 
                                onChange={e => setAssignForm({...assignForm, bus_ppu: e.target.value.toUpperCase()})}
                            />
                        </div>
                        
                        <button 
                            className="btn primary" 
                            style={{ width: '100%', padding: '12px' }} 
                            onClick={submitAssign}
                            disabled={!!processing}
                        >
                            {processing ? 'Asignando...' : 'Confirmar Asignación'}
                        </button>
                    </div>
                </div>
            )}

            <div className="animate-fade-in">
                <ReadOnlyNotice me={me} />
                {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Módulos de Hardware</h2>
                    <p className="muted">Inventario de equipos físicos y reasignaciones a terreno.</p>
                </div>
                <button onClick={loadData} className="btn ghost" disabled={loading} title="Recargar">
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* --- ALERTS --- */}
            {error && (
                <div style={{ padding: '14px 18px', backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}
            {success && (
                <div style={{ padding: '14px 18px', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={18} /> {success}
                </div>
            )}

            {/* --- TOP KPIs: INVENTARIO GLOBAL --- */}
            <h3 className="title" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Inventario de Red Global</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Cpu size={28} color="#8B5CF6" />
                        <div>
                            <span className="muted small font-bold" style={{ display: 'block' }}>VALIDADORES</span>
                            <span className="muted small" style={{ fontSize: '0.8rem' }}>Total físicos</span>
                        </div>
                    </div>
                    <div className="title" style={{ fontSize: '2.5rem', margin: 0 }}>{stock?.inventario.validadores ?? '—'}</div>
                </div>
                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Monitor size={28} color="#EC4899" />
                        <div>
                            <span className="muted small font-bold" style={{ display: 'block' }}>CONSOLAS</span>
                            <span className="muted small" style={{ fontSize: '0.8rem' }}>Total físicas</span>
                        </div>
                    </div>
                    <div className="title" style={{ fontSize: '2.5rem', margin: 0 }}>{stock?.inventario.consolas ?? '—'}</div>
                </div>
                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Archive size={28} color="#F59E0B" />
                        <div>
                            <span className="muted small font-bold" style={{ display: 'block' }}>TOTAL SUMA</span>
                            <span className="muted small" style={{ fontSize: '0.8rem' }}>Todos los equipos</span>
                        </div>
                    </div>
                    <div className="title" style={{ fontSize: '2.5rem', margin: 0 }}>{stock?.inventario.total ?? '—'}</div>
                </div>
            </div>

            {/* --- BOTTOM: TABLE --- */}
            <div className="panel animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <CheckCircle size={22} color="#10B981" />
                    <div>
                        <h3 className="title" style={{ margin: 0, fontSize: '1.15rem' }}>
                            Listos para Instalación ({stock?.listos.length ?? 0})
                        </h3>
                        <p className="muted small" style={{ margin: 0 }}>Equipos aprobados por QA, disponibles para instalar en buses.</p>
                    </div>
                </div>

                {(!stock || stock.listos.length === 0) && !loading && (
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                        <BoxSelect size={42} style={{ opacity: 0.15, margin: '0 auto 12px' }} />
                        <p className="muted">No hay equipos disponibles para instalación en este momento.</p>
                    </div>
                )}

                {stock && stock.listos.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px 14px' }} className="muted small">OS</th>
                                    <th style={{ padding: '10px 14px' }} className="muted small">Tipo</th>
                                    <th style={{ padding: '10px 14px' }} className="muted small">Serie</th>
                                    <th style={{ padding: '10px 14px' }} className="muted small">Bus Origen</th>
                                    <th style={{ padding: '10px 14px' }} className="muted small">Fecha</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'right' }} className="muted small">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stock.listos.map(t => (
                                    <tr key={t.codigo_os} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{t.codigo_os}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {t.tipo_equipo === 'VALIDADOR'
                                                    ? <Cpu size={15} color="#8B5CF6"/>
                                                    : <Monitor size={15} color="#EC4899"/>}
                                                <span>{t.tipo_equipo}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>{t.serie}</td>
                                        <td style={{ padding: '12px 14px' }}>{t.bus_ppu}</td>
                                        <td style={{ padding: '12px 14px' }} className="muted">{new Date(t.fecha).toLocaleDateString('es-CL')}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                            {canWrite ? (
                                                <button 
                                                    className="btn primary" 
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                                                    onClick={() => {
                                                        setAssignForm({ tecnico_id: '', bus_ppu: t.bus_ppu || ''});
                                                        setAssigningTicket(t);
                                                    }}
                                                >
                                                    <UserPlus size={14}/> Asignar
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontWeight: 600 }}>
                                                    👁 Solo lectura
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
        </>
    );
}
