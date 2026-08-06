import React, { useEffect, useState } from "react";
import { 
    X, Wrench, PauseCircle, CheckCircle, 
    AlertTriangle, Package, Plus, Clock, PlayCircle 
} from "lucide-react";
import { api } from "../api/http"; // Usa tu archivo http.ts existente
import { moveTicket } from "../api/lab"; 
import { FALLAS_VALIDADOR, FALLAS_CONSOLA, ACCIONES_REPARACION } from "../data/fallas";

interface RepairModalProps {
    os: string; 
    fallaReportada?: string; 
    initialState: number;    
    onClose: () => void;
    onSuccess: () => void;   
}

interface RepuestoDB {
    id: number;
    nombre: string;
    categoria: string;
    stock: number;
}

export default function RepairModal({ os, fallaReportada, initialState, onClose, onSuccess }: RepairModalProps) {
    const [viewState, setViewState] = useState<'START' | 'WORK'>(initialState === 4 ? 'START' : 'WORK');
    const [mode, setMode] = useState<'REPAIR' | 'PART'>('REPAIR');
    const [loading, setLoading] = useState(false);
    const [repuestosCatalog, setRepuestosCatalog] = useState<RepuestoDB[]>([]);
    
    const [fallaDetectada, setFallaDetectada] = useState("");
    const [accionesSel, setAccionesSel] = useState<string[]>([]);
    const [repuestosSel, setRepuestosSel] = useState<string[]>([]); 
    const [comentario, setComentario] = useState("");
    const [repuestoSolicitado, setRepuestoSolicitado] = useState("");

    const isValidador = os.startsWith('MV') || os.startsWith('PDV');
    const listaFallas = isValidador ? FALLAS_VALIDADOR : FALLAS_CONSOLA;
    const tipoEquipoDb = isValidador ? 'VALIDADOR' : 'CONSOLA';

    useEffect(() => {
        api.get('/api/lab/parts')
           .then(res => setRepuestosCatalog(res.data))
           .catch(err => console.error("Error cargando repuestos", err));
    }, []);

    const handleStartWork = async () => {
        setLoading(true);
        try {
            await moveTicket(os, 5); 
            setViewState('WORK');    
        } catch (e) {
            console.error(e);
            alert("No se pudo iniciar el ticket. Revisa conexión.");
        } finally {
            setLoading(false);
        }
    };

    const toggleAccion = (acc: string) => {
        setAccionesSel(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]);
    };

    const addRepuesto = (nombre: string) => {
        if (nombre && !repuestosSel.includes(nombre)) setRepuestosSel([...repuestosSel, nombre]);
    };

    const removeRepuesto = (nombre: string) => {
        setRepuestosSel(prev => prev.filter(p => p !== nombre));
    };

    const handleSubmitRepair = async () => {
        if (!fallaDetectada) return alert("Debes indicar la falla real detectada.");
        if (accionesSel.length === 0) return alert("Debes indicar qué acciones realizaste.");
        
        setLoading(true);
        try {
            await api.post("/api/lab/finish", { 
                codigo_os: os, 
                falla: fallaDetectada,
                acciones: accionesSel, 
                repuestos: repuestosSel,
                comentario
            });
            onSuccess(); 
        } catch (e: any) {
            console.error(e);
            // Mensaje más claro si hay error
            const msg = e.response?.data?.error || "Error al guardar.";
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPart = async () => {
        if (!repuestoSolicitado) return alert("Selecciona el repuesto.");
        setLoading(true);
        try {
            await api.post("/api/lab/request-part", { 
                codigo_os: os, 
                repuesto: repuestoSolicitado, 
                comentario
            });
            onSuccess(); 
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.error || "Error al solicitar.";
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const repuestosFiltrados = repuestosCatalog.filter(r => r.categoria === tipoEquipoDb);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }`}</style>

            <div className="panel animate-fade-in custom-scrollbar" style={{ width: 600, maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: 15, marginBottom: 0 }}>
                    <div><h3 className="title" style={{margin:0, fontSize: '1.4rem'}}>Gestión Técnica: {os}</h3><span className="badge" style={{marginTop: 5, fontSize: '0.75rem'}}>{isValidador ? 'VALIDADOR' : 'CONSOLA'}</span></div>
                    <button onClick={onClose} className="btn ghost" style={{height: 'fit-content'}}><X size={24}/></button>
                </div>

                {viewState === 'START' && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', marginBottom: 25, border: '2px solid rgba(245, 158, 11, 0.2)' }}><Clock size={48} /></div>
                        <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 10 }}>¿Listo para comenzar?</h2>
                        <p className="muted" style={{ marginBottom: 30, maxWidth: 400 }}>Al iniciar, el ticket pasará a estado <strong>EN REPARACIÓN</strong>.</p>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 12, marginBottom: 40, textAlign: 'left', width: '100%', border: '1px solid #333' }}>
                            <div className="muted small" style={{marginBottom: 5, letterSpacing: 1}}>FALLA REPORTADA (ORIGEN)</div>
                            <div style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', gap: 10, alignItems: 'center' }}><AlertTriangle size={20}/> {fallaReportada || "Sin detalle de falla"}</div>
                        </div>
                        <button className="btn" onClick={handleStartWork} disabled={loading} style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '18px 40px', fontSize: '1.1rem', width: '100%', display: 'flex', justifyContent: 'center', gap: 12, borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>{loading ? "Procesando..." : <><PlayCircle size={24} /> INICIAR REPARACIÓN AHORA</>}</button>
                    </div>
                )}

                {viewState === 'WORK' && (
                    <div className="animate-fade-in" style={{ paddingTop: 20 }}>
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px 15px', borderRadius: 8, marginBottom: 25, border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ background: '#EF4444', padding: 6, borderRadius: 6, display: 'flex' }}><AlertTriangle size={18} color="white"/></div>
                            <div><div className="muted small" style={{color: '#EF4444', fontWeight: 'bold', fontSize: '0.7rem'}}>FALLA REPORTADA</div><strong style={{ color: '#FECACA', fontSize: '0.95rem' }}>{fallaReportada}</strong></div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginBottom: 25, borderBottom: '1px solid var(--border-color)', paddingBottom: 15 }}>
                            <button className={`btn ${mode === 'REPAIR' ? '' : 'ghost'}`} onClick={() => setMode('REPAIR')} style={{ flex: 1, justifyContent: 'center' }}><Wrench size={18}/> Finalizar Reparación</button>
                            <button className={`btn ${mode === 'PART' ? '' : 'ghost'}`} onClick={() => setMode('PART')} style={{ color: mode === 'PART' ? '#F59E0B' : 'inherit', flex: 1, justifyContent: 'center' }}><PauseCircle size={18}/> Solicitar Repuesto</button>
                        </div>

                        {mode === 'REPAIR' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div><label className="muted small" style={{display:'block', marginBottom: 8}}>1. DIAGNÓSTICO TÉCNICO (REAL)</label><select className="input" value={fallaDetectada} onChange={e => setFallaDetectada(e.target.value)} style={{ width: '100%', padding: 12 }}><option value="">-- Selecciona la falla confirmada --</option>{listaFallas.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                                <div>
                                    <label className="muted small" style={{display:'block', marginBottom: 8}}>2. ACCIONES REALIZADAS</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{ACCIONES_REPARACION.map(acc => (<label key={acc} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: accionesSel.includes(acc) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', border: accionesSel.includes(acc) ? '1px solid #10B981' : '1px solid transparent', transition: 'all 0.2s' }}><input type="checkbox" checked={accionesSel.includes(acc)} onChange={() => toggleAccion(acc)} style={{ accentColor: '#10B981', transform: 'scale(1.2)' }}/><span style={{fontSize:'0.9rem'}}>{acc}</span></label>))}</div>
                                </div>
                                <div>
                                    <label className="muted small" style={{display:'block', marginBottom: 8}}>3. REPUESTOS UTILIZADOS (OPCIONAL)</label>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}><select className="input" id="selRepuesto" style={{flex: 1}}><option value="">-- Agregar Repuesto --</option>{repuestosFiltrados.map(r => <option key={r.id} value={r.nombre}>{r.nombre} (Stock: {r.stock})</option>)}</select><button className="btn" onClick={() => { const val = (document.getElementById('selRepuesto') as HTMLSelectElement).value; addRepuesto(val); }}><Plus size={20}/></button></div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{repuestosSel.map(r => (<div key={r} style={{ padding: '6px 12px', borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(16, 185, 129, 0.3)' }}><Package size={14}/> {r}<button onClick={() => removeRepuesto(r)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer', display: 'flex'}}><X size={14}/></button></div>))}</div>
                                </div>
                                <div><label className="muted small" style={{display:'block', marginBottom: 8}}>COMENTARIOS ADICIONALES</label><textarea className="input" rows={2} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Detalles técnicos extra para QA..." style={{ width: '100%' }}/></div>
                                <button className="btn full" disabled={loading} onClick={handleSubmitRepair} style={{ backgroundColor: '#10B981', color: 'white', marginTop: 15, padding: 16, fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: 10 }}>{loading ? 'Guardando...' : <><CheckCircle size={20}/> FINALIZAR Y ENVIAR AL JEFE</>}</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ padding: 20, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 10, border: '1px solid #F59E0B', color: '#F59E0B', display: 'flex', gap: 15, alignItems: 'start' }}><AlertTriangle size={24} style={{flexShrink: 0}}/> <div><strong>DETENER SLA Y SOLICITAR STOCK</strong><p style={{margin: '5px 0 0', fontSize: '0.9rem', opacity: 0.9}}>El ticket quedará en estado <strong>ESPERA DE REPUESTO</strong>.</p></div></div>
                                <div><label className="muted small" style={{display:'block', marginBottom: 8}}>REPUESTO FALTANTE</label><select className="input" value={repuestoSolicitado} onChange={e => setRepuestoSolicitado(e.target.value)} style={{ width: '100%', padding: 12 }}><option value="">-- Selecciona del catálogo --</option>{repuestosFiltrados.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}</select></div>
                                <div><label className="muted small" style={{display:'block', marginBottom: 8}}>OBSERVACIÓN PARA BODEGA</label><textarea className="input" rows={3} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Ej: Necesito 2 unidades, es urgente..." style={{ width: '100%' }}/></div>
                                <button className="btn full" disabled={loading} onClick={handleRequestPart} style={{ backgroundColor: '#F59E0B', color: 'white', marginTop: 10, padding: 16, fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: 10 }}>{loading ? 'Procesando...' : <><PauseCircle size={20}/> SOLICITAR Y PAUSAR TICKET</>}</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}