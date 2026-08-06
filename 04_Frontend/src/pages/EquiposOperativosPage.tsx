import React, { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Me } from "../api/me";
import { getEquiposOperativos, EquipoOperativo } from "../api/dashboard";
import {
    RefreshCw, 
    Search, 
    Cpu, 
    Monitor, 
    Bus,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Info
} from "lucide-react";
import ReadOnlyNotice from "../components/ReadOnlyNotice";

export default function EquiposOperativosPage() {
    const me = useOutletContext<Me | null>();
    const [data, setData] = useState<EquipoOperativo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await getEquiposOperativos(searchTerm, page * limit);
            setData(resp.data);
            setTotal(resp.pagination.total);
        } catch (err: any) {
            console.error("Error loading operativos:", err);
            setError(err.response?.data?.error || "Error cargando datos de la API");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, page]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, page, loadData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0); // Reset to first page on search
    };

    return (
        <div className="animate-fade-in">
            <ReadOnlyNotice me={me} />
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Equipos en Operación</h2>
                    <p className="muted">Listado detallado de activos instalados y operativos en la flota.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted-color)' }} />
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="Buscar por Serie o PPU..." 
                            style={{ paddingLeft: '40px', width: '300px' }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <button onClick={() => loadData()} className="btn ghost" disabled={loading}>
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div style={{ 
                    padding: '14px 18px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    color: '#EF4444', 
                    borderRadius: '10px', 
                    marginBottom: '20px', 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    <AlertCircle size={20} />
                    <span style={{ fontWeight: 500 }}>{error}</span>
                </div>
            )}

            {/* INFO PANEL */}
            <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: '12px', 
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <Info size={20} color="#3B82F6" />
                <p style={{ fontSize: '0.9rem', margin: 0, color: '#1E40AF' }}>
                    Este listado muestra únicamente los <strong>Validadores</strong> y <strong>Consolas</strong> que se encuentran actualmente instalados en buses y sin reportes de falla activos.
                </p>
            </div>

            {/* TABLE PANEL */}
            <div className="panel">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '16px' }} className="muted small">TIPO</th>
                                <th style={{ padding: '16px' }} className="muted small">SERIE</th>
                                <th style={{ padding: '16px' }} className="muted small">MODELO / MARCA</th>
                                <th style={{ padding: '16px' }} className="muted small">BUS (PPU)</th>
                                <th style={{ padding: '16px' }} className="muted small">ÚLT. OPERACIÓN</th>
                                <th style={{ padding: '16px', textAlign: 'center' }} className="muted small">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && data.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>
                                            <div className="animate-pulse" style={{ height: '20px', backgroundColor: 'var(--border-color)', borderRadius: '4px', width: '100%' }}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                                        <AlertCircle size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                                        <p className="muted">No se encontraron equipos operativos con los filtros aplicados.</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map(eq => (
                                    <tr key={eq.serie} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {eq.tipo === 'VALIDADOR' 
                                                    ? <Cpu size={18} color="#8B5CF6" /> 
                                                    : <Monitor size={18} color="#EC4899" />}
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{eq.tipo}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '500', fontFamily: 'monospace' }}>{eq.serie}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: '0.9rem' }}>{eq.modelo}</div>
                                            <div className="muted small">{eq.marca}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {eq.bus_ppu ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 600 }}>
                                                    <Bus size={16} />
                                                    <span>{eq.bus_ppu}</span>
                                                </div>
                                            ) : (
                                                <span className="muted small">— Sin Asignar —</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }} className="muted small">
                                            {eq.ultima_operacion ? new Date(eq.ultima_operacion).toLocaleDateString('es-CL') : 'N/A'}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                                                color: '#10B981', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700 
                                            }}>
                                                OPERATIVO
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div className="muted small">
                        Mostrando {data.length} de {total} activos
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn ghost" 
                            disabled={page === 0 || loading} 
                            onClick={() => setPage(page - 1)}
                            style={{ padding: '8px' }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.9rem', fontWeight: 600 }}>
                            Página {page + 1}
                        </div>
                        <button 
                            className="btn ghost" 
                            disabled={(page + 1) * limit >= total || loading} 
                            onClick={() => setPage(page + 1)}
                            style={{ padding: '8px' }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
