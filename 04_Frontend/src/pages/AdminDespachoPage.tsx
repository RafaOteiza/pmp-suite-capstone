import React, { useEffect, useState } from "react";
import { api } from "../api/http";
import { useAlert } from "../hooks/useAlert";
import CustomModal from "../components/CustomModal";
import { Truck, CheckSquare, RefreshCw, PackageCheck, ClipboardCheck } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { getApiErrorMessage } from "../api/errors";

interface DispatchTicket {
    codigo_os: string;
    tipo_equipo: string;
    falla: string;
    bus_ppu: string;
    serie: string;
    tecnico_reparador: string;
    fecha_reparacion: string;
}

export default function AdminDespachoPage() {
    const me = useOutletContext<Me | null>();
    const canDispatch = can(me, PERMISSIONS.DISPATCH_WRITE);
    const [tickets, setTickets] = useState<DispatchTicket[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const { modal, showConfirm, showAlert, closeAlert } = useAlert();

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/dispatch-queue");
            setTickets(res.data);
            setSelected([]); // Limpiar selección al recargar
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Manejo de selección (Checkbox)
    const toggleSelect = (os: string) => {
        if (!canDispatch) return;
        setSelected(prev => prev.includes(os) ? prev.filter(x => x !== os) : [...prev, os]);
    };

    const toggleAll = () => {
        if (!canDispatch) return;
        if (selected.length === tickets.length) setSelected([]);
        else setSelected(tickets.map(t => t.codigo_os));
    };

    // Acción de Despachar
    const handleDispatch = async () => {
        if (!canDispatch) return;
        if (selected.length === 0) {
            return showAlert('error', 'Error', 'Selecciona al menos un equipo.');
        }

        showConfirm(
            'Confirmar Despacho',
            `¿Confirmas el despacho de ${selected.length} equipos a Bodega?`,
            async () => {
                closeAlert();
                setProcessing(true);
                try {
                    await api.post("/api/admin/dispatch", { codigos_os: selected });
                    showAlert('success', 'Éxito', 'Equipos despachados exitosamente.', () => {
                        closeAlert();
                        load();
                    });
                } catch (e) {
                    console.error(e);
                    showAlert('error', 'Error', getApiErrorMessage(e, 'No se pudo procesar el despacho.'));
                } finally {
                    setProcessing(false);
                }
            }
        );
    };

    return (
        <>
            <CustomModal 
                isOpen={canDispatch && modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={closeAlert}
                confirmText={modal.confirmText}
            />
        <div className="panel animate-fade-in">
            <ReadOnlyNotice me={me} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <div>
                    <h2 className="title">Control de Salida · Laboratorio</h2>
                    <p className="muted">Equipos reparados listos para ser devueltos a Bodega.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={load} className="btn ghost" disabled={loading} title="Actualizar">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* BARRA DE ACCIÓN */}
            <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #10B981' }}>
                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                    <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, color: '#10B981' }}>
                        <PackageCheck size={24} />
                    </div>
                    <div>
                        <div className="title" style={{ fontSize: '1.5rem', margin: 0 }}>{tickets.length}</div>
                        <div className="muted small">LISTOS PARA DESPACHO</div>
                    </div>
                </div>
                
                {canDispatch && tickets.length > 0 && (
                    <button 
                        className="btn" 
                        disabled={selected.length === 0 || processing}
                        onClick={handleDispatch}
                        style={{ 
                            backgroundColor: selected.length > 0 ? '#10B981' : '#374151', 
                            color: 'white', cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold'
                        }}
                    >
                        {processing ? "Procesando..." : <><Truck size={20} style={{marginRight: 10}}/> DESPACHAR ({selected.length})</>}
                    </button>
                )}
            </div>

            {/* TABLA DE DESPACHO */}
            {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 50, opacity: 0.5 }}>
                    <ClipboardCheck size={48} style={{ marginBottom: 10 }} />
                    <p>No hay equipos pendientes de despacho.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                {canDispatch && <th style={{ padding: 12, width: 40 }}>
                                    <input type="checkbox" checked={selected.length === tickets.length} onChange={toggleAll} style={{accentColor: '#10B981', transform: 'scale(1.2)'}} />
                                </th>}
                                <th style={{ padding: 12 }}>TICKET</th>
                                <th style={{ padding: 12 }}>EQUIPO</th>
                                <th style={{ padding: 12 }}>TÉCNICO</th>
                                <th style={{ padding: 12 }}>FALLA RESUELTA</th>
                                <th style={{ padding: 12 }}>FECHA REP.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t.codigo_os} className="hover-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {canDispatch && <td style={{ padding: 12 }}>
                                        <input type="checkbox" checked={selected.includes(t.codigo_os)} onChange={() => toggleSelect(t.codigo_os)} style={{accentColor: '#10B981', transform: 'scale(1.2)'}} />
                                    </td>}
                                    <td style={{ padding: 12, fontWeight: 'bold' }}>{t.codigo_os}</td>
                                    <td style={{ padding: 12 }}>
                                        <div style={{fontWeight:'bold'}}>{t.serie}</div>
                                        <div className="muted small">{t.tipo_equipo}</div>
                                    </td>
                                    <td style={{ padding: 12 }}>{t.tecnico_reparador || "Sin datos"}</td>
                                    <td style={{ padding: 12, color: '#10B981' }}>{t.falla}</td>
                                    <td style={{ padding: 12, opacity: 0.7 }}>{new Date(t.fecha_reparacion).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </>
    );
}
