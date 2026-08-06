import React, { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { api } from "../api/http";
import { useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import ReadOnlyNotice from "../components/ReadOnlyNotice";

const getEstadoBadge = (estado_nombre: string) => {
  const name = estado_nombre?.toUpperCase() || "DESCONOCIDO";
  if (name.includes("DISPONIBLE") || name.includes("FINALIZADO") || name.includes("CERRAD")) {
    return <div className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>{name}</div>;
  }
  if (name.includes("DIAGNOSTICO") || name.includes("REPARACION") || name.includes("TALLER")) {
    return <div className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>{name}</div>;
  }
  if (name.includes("BODEGA") || name.includes("TRANSITO") || name.includes("RECIBIDO")) {
    return <div className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>{name}</div>;
  }
  if (name.includes("QA")) {
    return <div className="badge" style={{ background: "rgba(56,189,248,0.1)", color: "#38BDF8" }}>{name}</div>;
  }
  return <div className="badge">{name}</div>;
};

export default function TrazabilidadPage() {
  const me = useOutletContext<Me | null>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      // Usamos el mismo endpoint global-search pero para llenar una tabla completa
      const res = await api.get(`/api/dashboard/global-search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <ReadOnlyNotice me={me} />
      <div className="page-header">
        <div>
          <h2>🔎 Trazabilidad e Historial</h2>
          <p className="muted">
            Busca el historial completo por PPU de Autobús, Serie de Equipo, Código OS o Ticket Aranda.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '25px 30px' }}>
        <form 
          onSubmit={handleSearch} 
          style={{ display: 'flex', gap: 15, alignItems: 'center' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', top: 15, left: 18, color: 'var(--primary)' }} size={24} />
            <input
              style={{ 
                width: '100%', 
                padding: '16px 20px 16px 55px', 
                height: 54, 
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
              }}
              placeholder="Ej: Patente (ABCD12), Serie (7123456), O.S. (MV-0045), Aranda (834192)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
              }}
            />
          </div>
          <button 
            type="submit" 
            className="btn primary" 
            style={{ height: 54, padding: '0 30px', fontSize: '1rem', display: 'flex', gap: 10, borderRadius: '12px' }}
            disabled={loading || !query.trim()}
          >
            {loading ? <Loader2 className="spin" size={22} /> : <Search size={22} />}
            Rastrear Historial
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 50, textAlign: 'center' }}>
              <Loader2 className="spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto 15px' }} />
              <p className="muted">Rastreando información logística...</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: 15 }}>📭</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No se encontraron coincidencias</p>
              <p className="muted" style={{ maxWidth: 400, margin: '10px auto 0' }}>
                No hay registros logísticos ni Órdenes de Servicio asociadas al término "{query}".
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    <th>Fecha (Ingreso)</th>
                    <th>N° Orden</th>
                    <th>ID Aranda</th>
                    <th>PPU Bus</th>
                    <th>Serie Equipo</th>
                    <th>Técnico Responsable</th>
                    <th>Ubicación</th>
                    <th>Estado de Ciclo</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="hover-bg animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {new Date(r.fecha).toLocaleDateString()}
                        </strong>
                        <div className="small muted">
                          {new Date(r.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' }}>
                          {r.codigo_os}
                        </div>
                      </td>
                      <td>
                        {r.ticket_aranda ? (
                          <div style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <ArrowRight size={14}/> {r.ticket_aranda}
                          </div>
                        ) : (
                          <span className="muted">--</span>
                        )}
                      </td>
                      <td>
                         <strong style={{ letterSpacing: 1 }}>{r.bus_ppu || 'STOCK'}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <span>{r.tipo_equipo === 'VALIDADOR' ? '💳' : '📟'}</span>
                           <span>{r.serie}</span>
                        </div>
                      </td>
                      <td>{r.tecnico_creador || 'No asignado'}</td>
                      <td>
                         <span style={{ fontSize: '0.9rem' }}>{r.ubicacion?.replace('Bodega ', '')}</span>
                      </td>
                      <td>{getEstadoBadge(r.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
