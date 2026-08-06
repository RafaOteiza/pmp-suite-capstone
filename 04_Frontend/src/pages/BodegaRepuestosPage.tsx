import React, { useEffect, useState } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Me } from "../api/me";
import { useAlert } from "../hooks/useAlert";
import CustomModal from "../components/CustomModal";
import { getRepuestos, updateRepuestoStock, entregarRepuesto, Repuesto, SolicitudRepuesto } from "../api/bodega";
import { Wrench, RefreshCw, AlertTriangle, CheckCircle, PackageSearch, Save, Edit2, Box, Cpu, Monitor } from "lucide-react";
import { can, PERMISSIONS } from "../app/rbac";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { getApiErrorMessage } from "../api/errors";

export default function BodegaRepuestosPage() {
  const me = useOutletContext<Me | null>();
  const canWrite = can(me, PERMISSIONS.BODEGA_WRITE);

  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudRepuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);
  const [processing, setProcessing] = useState<number | null>(null);
  const { modal, showConfirm, showAlert, closeAlert } = useAlert();
  
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'solicitudes';

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRepuestos();
      setRepuestos(data.repuestos);
      setSolicitudes(data.solicitudes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaveStock = async (id: number) => {
    if (!canWrite) return;
    try {
      await updateRepuestoStock(id, tempStock);
      setEditingStock(null);
      await load();
      showAlert('success', 'Stock Actualizado', 'El inventario se ha modificado correctamente.');
    } catch (err) {
      showAlert('error', 'Error', getApiErrorMessage(err, 'No se pudo actualizar el stock del repuesto.'));
    }
  };

  const handleEntregar = async (id: number) => {
    if (!canWrite) return;
    showConfirm(
        'Confirmar Entrega',
        '¿Confirmar entrega física del repuesto al Laboratorio? Esto devolverá el ticket a Reparación.',
        async () => {
            closeAlert();
            setProcessing(id);
            try {
                await entregarRepuesto(id);
                load();
                showAlert('success', 'Repuesto Entregado', 'La solicitud se ha procesado y el equipo ha vuelto a taller.');
            } catch (err) {
                showAlert('error', 'Error', getApiErrorMessage(err, 'Hubo un problema al procesar la entrega de repuestos.'));
            } finally {
                setProcessing(null);
            }
        }
    );
  };

  return (
    <>
      <CustomModal 
          isOpen={canWrite && modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={closeAlert}
          confirmText={modal.confirmText}
      />
    <div className="animate-fade-in">
      <ReadOnlyNotice me={me} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Inventario de Repuestos</h2>
          <p className="muted" style={{ margin: 0 }}>Gestión de piezas y solicitudes de laboratorio.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={load} className="btn ghost" disabled={loading} title="Actualizar">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- RENDERIZADO CONDICIONAL POR PESTAÑA URL --- */}
      <div>
        
        {/* TAB 1: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div className="panel animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <h3 className="title" style={{ margin: 0 }}>Solicitudes Pendientes ({solicitudes.length})</h3>
            </div>
            
            {solicitudes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <CheckCircle size={48} color="#10B981" style={{ opacity: 0.5, margin: '0 auto 15px' }} />
                <p className="muted" style={{ fontSize: '1.1rem' }}>No hay solicitudes pendientes del Laboratorio.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {solicitudes.map(s => (
                  <div key={s.id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{s.codigo_os}</span>
                      <span className="badge" style={{ background: '#F59E0B20', color: '#F59E0B' }}>URGENTE</span>
                    </div>
                    <div className="small muted" style={{ marginBottom: '20px' }}>
                      Fecha: {new Date(s.fecha_solicitud).toLocaleString('es-CL')}
                    </div>
                    {canWrite ? (
                      <button 
                        className="btn primary" 
                        style={{ width: '100%', fontSize: '0.9rem', padding: '10px' }}
                        onClick={() => handleEntregar(s.id)}
                        disabled={processing === s.id}
                      >
                        {processing === s.id ? <RefreshCw className="animate-spin" size={16}/> : 'Confirmar Entrega Física'}
                      </button>
                    ) : (
                      <span style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '0.85rem', padding: '8px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontWeight: 600 }}>
                        👁 Solo lectura
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VALIDADOR */}
        {activeTab === 'validador' && (
          <div className="panel animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Cpu size={24} color="#8B5CF6" />
              <div>
                <h3 className="title" style={{ margin: 0, fontSize: '1.25rem' }}>Inventario: Validador</h3>
                <p className="muted small" style={{ margin: 0 }}>Stock de componentes de Validadores</p>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }} className="muted small">Repuesto</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }} className="muted small">Stock Actual</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }} className="muted small">Estado</th>
                    {canWrite && <th style={{ padding: '12px 14px', textAlign: 'right' }} className="muted small">Ajustar Stock</th>}
                  </tr>
                </thead>
                <tbody>
                  {repuestos.filter(r => r.categoria === 'VALIDADOR').map(r => {
                    const critico = r.diferencia <= 0;
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px', fontWeight: 'bold' }}>{r.nombre}</td>
                        <td style={{ padding: '14px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
                          {editingStock === r.id ? (
                            <input 
                              type="number" 
                              value={tempStock}
                              onChange={(e) => setTempStock(parseInt(e.target.value) || 0)}
                              style={{ width: '80px', textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'inherit', borderRadius: 6, padding: '6px' }}
                              autoFocus
                            />
                          ) : r.stock}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          {critico ? (
                            <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, background: '#EF444415', padding: '4px 8px', borderRadius: '4px' }}>
                              Crítico (&lt; {r.stock_critico})
                            </span>
                          ) : (
                            <span style={{ color: '#10B981', fontSize: '0.85rem', background: '#10B98115', padding: '4px 8px', borderRadius: '4px' }}>
                              Sano
                            </span>
                          )}
                        </td>
                        {canWrite && (
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            {editingStock === r.id ? (
                              <button className="btn" style={{ padding: '6px 12px', background: '#10B981', color: 'white', border: 'none' }} onClick={() => handleSaveStock(r.id)}>
                                <Save size={16} /> Guardar
                              </button>
                            ) : (
                              <button className="btn ghost" style={{ padding: '6px 12px' }} onClick={() => { setEditingStock(r.id); setTempStock(r.stock); }}>
                                <Edit2 size={16} /> Modificar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CONSOLA */}
        {activeTab === 'consola' && (
          <div className="panel animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Monitor size={24} color="#EC4899" />
              <div>
                <h3 className="title" style={{ margin: 0, fontSize: '1.25rem' }}>Inventario: Consola</h3>
                <p className="muted small" style={{ margin: 0 }}>Stock de componentes de Consolas</p>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }} className="muted small">Repuesto</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }} className="muted small">Stock Actual</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }} className="muted small">Estado</th>
                    {canWrite && <th style={{ padding: '12px 14px', textAlign: 'right' }} className="muted small">Ajustar Stock</th>}
                  </tr>
                </thead>
                <tbody>
                  {repuestos.filter(r => r.categoria === 'CONSOLA').map(r => {
                    const critico = r.diferencia <= 0;
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px', fontWeight: 'bold' }}>{r.nombre}</td>
                        <td style={{ padding: '14px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
                          {editingStock === r.id ? (
                            <input 
                              type="number" 
                              value={tempStock}
                              onChange={(e) => setTempStock(parseInt(e.target.value) || 0)}
                              style={{ width: '80px', textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'inherit', borderRadius: 6, padding: '6px' }}
                              autoFocus
                            />
                          ) : r.stock}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          {critico ? (
                            <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, background: '#EF444415', padding: '4px 8px', borderRadius: '4px' }}>
                              Crítico (&lt; {r.stock_critico})
                            </span>
                          ) : (
                            <span style={{ color: '#10B981', fontSize: '0.85rem', background: '#10B98115', padding: '4px 8px', borderRadius: '4px' }}>
                              Sano
                            </span>
                          )}
                        </td>
                        {canWrite && (
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            {editingStock === r.id ? (
                              <button className="btn" style={{ padding: '6px 12px', background: '#10B981', color: 'white', border: 'none' }} onClick={() => handleSaveStock(r.id)}>
                                <Save size={16} /> Guardar
                              </button>
                            ) : (
                              <button className="btn ghost" style={{ padding: '6px 12px' }} onClick={() => { setEditingStock(r.id); setTempStock(r.stock); }}>
                                <Edit2 size={16} /> Modificar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}
