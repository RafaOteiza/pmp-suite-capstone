import { useEffect, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";
import type { Me } from "../api/me";
import { listOs, type OrdenServicio, type OsListResponse } from "../api/os";
import { getApiErrorMessage } from "../api/errors";
import ReadOnlyNotice from "../components/ReadOnlyNotice";

const EMPTY: OsListResponse = { items: [], pagination: { total: 0, limit: 25, offset: 0 } };

export default function OrdenesServicioPage() {
  const me = useOutletContext<Me | null>();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | "VALIDADOR" | "CONSOLA">("");
  const [data, setData] = useState<OsListResponse>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (offset = 0) => {
    setLoading(true);
    setError("");
    try {
      setData(await listOs({ q: query.trim(), tipo_equipo: type, offset, limit: 25 }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "No se pudieron cargar las órdenes de servicio"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(0); }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void load(0);
  };

  const page = Math.floor(data.pagination.offset / data.pagination.limit) + 1;
  const pages = Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit));

  return (
    <div className="panel animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 className="title" style={{ marginBottom: 4 }}>Órdenes de servicio</h2>
          <p className="muted" style={{ margin: 0 }}>Consulta global y trazable de la operación.</p>
        </div>
        <button className="btn ghost" onClick={() => void load(data.pagination.offset)} disabled={loading} aria-label="Actualizar órdenes">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <ReadOnlyNotice me={me} />
      {error && <div role="alert" style={{ color: "#FCA5A5", marginBottom: 16 }}>{error}</div>}

      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input className="input" aria-label="Buscar órdenes" value={query} maxLength={100} onChange={(e) => setQuery(e.target.value)} placeholder="OS, Aranda, bus o serie" style={{ flex: "1 1 260px" }} />
        <select className="input" aria-label="Tipo de equipo" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="">Todos los equipos</option>
          <option value="VALIDADOR">Validadores</option>
          <option value="CONSOLA">Consolas</option>
        </select>
        <button className="btn" type="submit" disabled={loading}><Search size={17} /> Consultar</button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ width: "100%" }}>
          <thead><tr><th>OS</th><th>Fecha</th><th>Equipo</th><th>Bus</th><th>Estado</th><th>Ubicación</th><th>Responsable</th></tr></thead>
          <tbody>
            {data.items.map((order: OrdenServicio) => (
              <tr key={order.codigo_os}>
                <td><strong>{order.codigo_os}</strong>{order.ticket_aranda ? <div className="small muted">Aranda: {order.ticket_aranda}</div> : null}</td>
                <td>{new Date(order.fecha).toLocaleDateString()}</td>
                <td>{order.tipo_equipo}<div className="small muted">{order.serie}</div></td>
                <td>{order.bus_ppu || "STOCK"}</td>
                <td><span className="badge">{order.estado_nombre}</span></td>
                <td>{order.ubicacion_nombre || "—"}</td>
                <td>{order.tecnico_laboratorio || order.tecnico_terreno || "Sin asignar"}</td>
              </tr>
            ))}
            {!loading && data.items.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }} className="muted">Sin órdenes para los filtros seleccionados.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span className="small muted">Página {page} de {pages} · {data.pagination.total} registros</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" disabled={loading || data.pagination.offset === 0} onClick={() => void load(Math.max(0, data.pagination.offset - data.pagination.limit))}>Anterior</button>
          <button className="btn ghost" disabled={loading || data.pagination.offset + data.pagination.limit >= data.pagination.total} onClick={() => void load(data.pagination.offset + data.pagination.limit)}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}
