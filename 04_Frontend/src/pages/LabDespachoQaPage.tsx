import React, { useState, useEffect } from "react";
import { getCompletedLab, dispatchToQa, LabTicket } from "../api/lab";
import CustomModal, { ModalType } from "../components/CustomModal";
import { CheckSquare, Square, Package, RefreshCw, Truck, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { getApiErrorMessage } from "../api/errors";

export default function LabDespachoQaPage() {
  const me = useOutletContext<Me | null>();
  const canDispatch = can(me, PERMISSIONS.LAB_DISPATCH);
  const [tickets, setTickets] = useState<LabTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [dispatching, setDispatching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modal, setModal] = useState({ 
    open: false, 
    type: 'confirm' as ModalType, 
    title: '', 
    message: '' 
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCompletedLab();
      setTickets(data);
      setSelected([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (codigo: string) => {
    if (!canDispatch) return;
    setSelected(prev => 
      prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
    );
  };

  const toggleSelectAll = () => {
    if (!canDispatch) return;
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(t => t.codigo_os));
    }
  };

  const handleDispatchClick = () => {
    if (!canDispatch) return;
    if (selected.length === 0) return;
    setModal({
        open: true,
        type: 'confirm',
        title: 'Confirmar Despacho a Bodega',
        message: `¿Estás seguro de enviar ${selected.length} equipos de regreso a Bodega Mersan?`
    });
  };

  const executeDispatch = async () => {
    if (!canDispatch) return;
    setModal({ ...modal, open: false });
    setDispatching(true);
    try {
      await dispatchToQa(selected);
      load();
    } catch (err) {
      setModal({
          open: true,
          type: 'error',
          title: 'Error de Despacho',
          message: getApiErrorMessage(err, 'Hubo un problema al procesar el envío a bodega.')
      });
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const filtered = tickets.filter(t => 
    t.codigo_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.serie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <CustomModal 
          isOpen={canDispatch && modal.open}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={modal.type === 'confirm' ? executeDispatch : () => setModal({ ...modal, open: false })}
          onCancel={() => setModal({ ...modal, open: false })}
          confirmText={modal.type === 'confirm' ? 'Despachar' : 'Cerrar'}
      />
    <div className="panel animate-fade-in">
      <ReadOnlyNotice me={me} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 5 }}>Despacho a Bodega</h2>
          <p className="muted" style={{ margin: 0 }}>Equipos de taller listos para ser devueltos a Bodega Mersan.</p>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
            <button onClick={load} className="btn ghost" disabled={loading} title="Actualizar">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            {canDispatch && <button 
                onClick={handleDispatchClick} 
                className="btn primary" 
                disabled={selected.length === 0 || dispatching}
                style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            >
                <Truck size={18} />
                {dispatching ? 'Despachando...' : `Despachar Selección (${selected.length})`}
            </button>}
        </div>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <div className="input" style={{ padding: '0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{padding: '10px 12px', opacity: 0.5}}><Search size={18} /></div>
            <input 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '10px 0', color: 'inherit' }}
              placeholder="Buscar OS o Serie..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    {canDispatch && <th style={{ padding: 15, width: 50, textAlign: 'center' }}>
                        <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                            {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare size={20} color="#8B5CF6"/> : <Square size={20}/>}
                        </button>
                    </th>}
                    <th style={{ padding: 15 }}>Orden Servicio</th>
                    <th style={{ padding: 15 }}>Equipo / Serie</th>
                    <th style={{ padding: 15 }}>Técnico Taller</th>
                    <th style={{ padding: 15 }}>Falla Reportada</th>
                </tr>
            </thead>
            <tbody>
                {filtered.length === 0 && !loading && (
                    <tr>
                        <td colSpan={canDispatch ? 5 : 4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Package size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
                            Aún no hay equipos finalizados en el Laboratorio.
                        </td>
                    </tr>
                )}
                {filtered.map(t => (
                    <tr 
                        key={t.codigo_os} 
                        style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onClick={canDispatch ? () => toggleSelect(t.codigo_os) : undefined}
                        className="hover-bg"
                    >
                        {canDispatch && <td style={{ padding: 15, textAlign: 'center' }}>
                            {selected.includes(t.codigo_os) ? <CheckSquare size={20} color="#8B5CF6"/> : <Square size={20} style={{ opacity: 0.5 }}/>}
                        </td>}
                        <td style={{ padding: 15, fontWeight: 'bold' }}>{t.codigo_os}</td>
                        <td style={{ padding: 15 }}>
                            <div>{t.tipo_equipo}</div>
                            <div className="muted small">{t.serie}</div>
                        </td>
                        <td style={{ padding: 15 }}>
                            <div className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                                {t.tecnico_laboratorio || 'No asignado'}
                            </div>
                        </td>
                        <td style={{ padding: 15, opacity: 0.8, fontSize: '0.9rem' }}>{t.falla}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
