import React, { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Me } from "../api/me";
import {
    getBodegaQueue, receiveInBodega, dispatchToLab, dispatchToQa, BodegaTicket
} from "../api/bodega";
import {
    RefreshCw, Package, Truck, CheckCircle, AlertTriangle,
    Zap, Archive, Monitor, Cpu, ArrowDownToLine, FlaskConical,
    RotateCcw, ShieldAlert
} from "lucide-react";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { getApiErrorMessage } from "../api/errors";

// ── Helpers visuales ────────────────────────────────────────────────────────

function OrigenChip({ t }: { t: BodegaTicket }) {
    // En tránsito: diferenciar origen
    if (t.estado_id === 2) return (
        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
            📍 Nuevo de Terreno
        </span>
    );
    if (t.estado_id === 11 && t.es_aprobado_qa === false) return (
        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
            ⚠️ Rec. QA — Rechazado
        </span>
    );
    if (t.estado_id === 11) return (
        <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
            🔬 Reparado — Desde Lab
        </span>
    );
    return null;
}

function DestinoIndicator({ t }: { t: BodegaTicket }) {
    // En Bodega: mostrar destino lógico
    if (t.es_aprobado_qa === false) return (
        <span style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
            🔄 Vuelve a Laboratorio
        </span>
    );
    if (t.fue_laboratorio && t.es_aprobado_qa == null) return (
        <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
            ✅ Listo para Control QA
        </span>
    );
    return (
        <span style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
            🔧 Enviar a Laboratorio
        </span>
    );
}

// ── Componente principal ─────────────────────────────────────────────────────

type Tab = 'transito' | 'para-lab' | 'para-qa';

export default function BodegaPage() {
    const me = useOutletContext<Me | null>();
    const canWrite = can(me, PERMISSIONS.BODEGA_WRITE);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab: Tab = (searchParams.get('tab') as Tab) || 'transito';

    const [tickets, setTickets] = useState<BodegaTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            setTickets(await getBodegaQueue());
        } catch (err) {
            setError("Error cargando operaciones de bodega.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => { setSuccess(""); setError(""); }, 3500);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    const handleAction = async (codigo: string, actionFn: (c: string) => Promise<any>, msg: string) => {
        if (!canWrite) return;
        setProcessing(codigo);
        setError("");
        setSuccess("");
        try {
            await actionFn(codigo);
            setSuccess(msg);
            await loadData();
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Error al procesar la acción."));
        } finally {
            setProcessing(null);
        }
    };

    // ── Particiones de datos ──────────────────────────────────────────────
    const enTransito = tickets.filter(t => t.estado_id === 2 || t.estado_id === 11);

    // Para Lab: en bodega (3) + nunca fue a lab, O rechazados por QA
    const paraLab = tickets.filter(t =>
        t.estado_id === 3 && (t.es_aprobado_qa === false || !t.fue_laboratorio)
    );

    // Para QA: en bodega (3) + fue laboratorio + aún no tiene resultado QA
    const paraQa = tickets.filter(t =>
        t.estado_id === 3 && t.fue_laboratorio && t.es_aprobado_qa == null
    );

    const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number; color: string }[] = [
        { key: 'transito',  label: 'Recepcionar',      icon: <ArrowDownToLine size={16}/>, count: enTransito.length, color: '#F59E0B' },
        { key: 'para-lab',  label: 'Para Laboratorio', icon: <Truck size={16}/>,           count: paraLab.length,    color: '#EF4444' },
        { key: 'para-qa',   label: 'Para Control QA',  icon: <FlaskConical size={16}/>,    count: paraQa.length,     color: '#10B981' },
    ];

    const cardBorderColor = (t: BodegaTicket) => {
        if (t.estado_id === 2) return '#F59E0B';
        if (t.es_aprobado_qa === false) return '#EF4444';
        if (t.estado_id === 11) return '#3B82F6';
        if (t.fue_laboratorio) return '#10B981';
        return '#F59E0B';
    };

    return (
        <div className="animate-fade-in">
            <ReadOnlyNotice me={me} />
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Bodega y Logística</h2>
                    <p className="muted">Recepciona y despacha equipos según su etapa en la cadena de reparación.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={loadData} className="btn ghost" disabled={loading} title="Recargar">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ── ALERTS ── */}
            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444', borderRadius: '10px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}
            {success && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: '10px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={18} /> {success}
                </div>
            )}

            {/* ── TABS ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setSearchParams({ tab: tab.key })}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : '3px solid transparent',
                            background: 'none',
                            color: activeTab === tab.key ? tab.color : 'var(--text-muted)',
                            fontWeight: activeTab === tab.key ? 700 : 500,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderRadius: '6px 6px 0 0',
                            backgroundColor: activeTab === tab.key ? `${tab.color}12` : 'transparent',
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{
                                background: tab.color, color: 'white',
                                fontSize: '0.7rem', fontWeight: 700,
                                minWidth: 18, height: 18, borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0 4px'
                            }}>{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 1: RECEPCIONAR (En Tránsito)                             */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'transito' && (
                <div>
                    <p className="muted small" style={{ marginBottom: 20 }}>
                        Equipos en camino a Bodega desde <strong>Terreno</strong> o desde <strong>Laboratorio / QA</strong>. Confirma la recepción para ingresarlos al stock.
                    </p>

                    {enTransito.length === 0 && !loading && (
                        <div className="panel" style={{ textAlign: 'center', padding: 50 }}>
                            <Truck size={40} style={{ opacity: 0.15, margin: '0 auto 12px' }} />
                            <p className="muted">No hay equipos en camino a bodega.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {enTransito.map(t => (
                            <div key={t.codigo_os} className="card" style={{ padding: 18, borderLeft: `4px solid ${cardBorderColor(t)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{t.codigo_os}</span>
                                        <span className="badge">{t.tipo_equipo}</span>
                                        <OrigenChip t={t} />
                                    </div>
                                    <span className="small muted">{t.serie}</span>
                                </div>
                                <div className="small muted" style={{ marginBottom: 12 }}>
                                    {t.tipo_equipo === 'VALIDADOR' ? <Cpu size={12}/> : <Monitor size={12}/>} Bus: <strong>{t.bus_ppu}</strong>
                                    {t.es_aprobado_qa === true && <span style={{ marginLeft: 8, color: '#10B981', fontWeight: 700 }}>QA ✓</span>}
                                    {t.es_aprobado_qa === false && <span style={{ marginLeft: 8, color: '#EF4444', fontWeight: 700 }}>QA ✗ Rechazado</span>}
                                </div>
                                {canWrite ? (
                                    <button
                                        className="btn primary"
                                        style={{ width: '100%', fontSize: '0.88rem' }}
                                        onClick={() => handleAction(t.codigo_os, receiveInBodega, `✅ ${t.codigo_os} recibido en Bodega.`)}
                                        disabled={processing === t.codigo_os}
                                    >
                                        {processing === t.codigo_os
                                            ? <RefreshCw className="animate-spin" size={15}/>
                                            : <><ArrowDownToLine size={15}/> Confirmar Recepción</>
                                        }
                                    </button>
                                ) : (
                                    <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontWeight: 600 }}>
                                        En tránsito hacia bodega
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 2: PARA LABORATORIO                                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'para-lab' && (
                <div>
                    <p className="muted small" style={{ marginBottom: 20 }}>
                        Equipos en Stock de Bodega que deben ser enviados a <strong>Laboratorio</strong>:
                        nuevos ingresos desde Terreno o equipos <strong>rechazados por QA</strong>.
                    </p>

                    {paraLab.length === 0 && !loading && (
                        <div className="panel" style={{ textAlign: 'center', padding: 50 }}>
                            <Archive size={40} style={{ opacity: 0.15, margin: '0 auto 12px' }} />
                            <p className="muted">No hay equipos pendientes para Laboratorio.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {paraLab.map(t => (
                            <div key={t.codigo_os} className="card" style={{ padding: 18, borderLeft: `4px solid ${t.es_aprobado_qa === false ? '#EF4444' : '#F59E0B'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{t.codigo_os}</span>
                                        <span className="badge">{t.tipo_equipo}</span>
                                        {t.es_aprobado_qa === false
                                            ? <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                                                <ShieldAlert size={11} style={{ display: 'inline', marginRight: 3 }}/>
                                                Rechazado por QA — Reingreso Lab
                                            </span>
                                            : <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                                                📍 Nuevo de Terreno
                                            </span>
                                        }
                                    </div>
                                    <span className="small muted">{t.serie}</span>
                                </div>
                                <p className="small muted" style={{ marginBottom: 14, opacity: 0.8 }}>{t.falla}</p>

                                {canWrite ? (
                                    <button
                                        className="btn"
                                        style={{ width: '100%', fontSize: '0.88rem', color: t.es_aprobado_qa === false ? '#EF4444' : '#F59E0B', border: `1px solid ${t.es_aprobado_qa === false ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}
                                        onClick={() => handleAction(t.codigo_os, dispatchToLab, `🔬 ${t.codigo_os} despachado a Laboratorio.`)}
                                        disabled={processing === t.codigo_os}
                                    >
                                        {processing === t.codigo_os
                                            ? <RefreshCw className="animate-spin" size={15}/>
                                            : <>{t.es_aprobado_qa === false ? <RotateCcw size={14}/> : <Zap size={14} color="#F59E0B"/>} Enviar a Laboratorio</>
                                        }
                                    </button>
                                ) : (
                                    <DestinoIndicator t={t} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 3: PARA CONTROL QA                                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'para-qa' && (
                <div>
                    <p className="muted small" style={{ marginBottom: 20 }}>
                        Equipos <strong>reparados en Laboratorio</strong> listos para su certificación de calidad.
                    </p>

                    {paraQa.length === 0 && !loading && (
                        <div className="panel" style={{ textAlign: 'center', padding: 50 }}>
                            <FlaskConical size={40} style={{ opacity: 0.15, margin: '0 auto 12px' }} />
                            <p className="muted">No hay equipos listos para Control QA.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {paraQa.map(t => (
                            <div key={t.codigo_os} className="card" style={{ padding: 18, borderLeft: '4px solid #10B981' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{t.codigo_os}</span>
                                        <span className="badge">{t.tipo_equipo}</span>
                                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                                            🔬 Reparado — Listo para QA
                                        </span>
                                    </div>
                                    <span className="small muted">{t.serie}</span>
                                </div>
                                <p className="small muted" style={{ marginBottom: 14, opacity: 0.8 }}>{t.falla}</p>

                                {canWrite ? (
                                    <button
                                        className="btn"
                                        style={{ width: '100%', fontSize: '0.88rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                                        onClick={() => handleAction(t.codigo_os, dispatchToQa, `✅ ${t.codigo_os} enviado a Control QA.`)}
                                        disabled={processing === t.codigo_os}
                                    >
                                        {processing === t.codigo_os
                                            ? <RefreshCw className="animate-spin" size={15}/>
                                            : <><FlaskConical size={14}/> Enviar a Control QA</>
                                        }
                                    </button>
                                ) : (
                                    <DestinoIndicator t={t} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
