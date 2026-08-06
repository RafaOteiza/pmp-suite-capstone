import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getDashboardSummary, DashboardSummary } from "../api/dashboard"; 
import { Me } from "../api/me";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Wrench, CheckCircle, Bus, Cpu, RefreshCw, AlertTriangle, Archive, Microscope, Clock, Brain } from "lucide-react"; 
import AIRiskPanel from "../components/AIRiskPanel";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import { can, PERMISSIONS } from "../app/rbac";
// Colores definidos para consistencia
const COLOR_CONSOLA = '#3B82F6';   // Azul
const COLOR_VALIDADOR = '#10B981'; // Verde

export default function DashboardPage() {
  const me = useOutletContext<Me | null>();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardSummary();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError("No se pudieron cargar las métricas.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
      <RefreshCw className="animate-spin" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
      <span className="muted">Cargando métricas...</span>
    </div>
  );

  if (error) {
    return (
        <div className="panel">
            <h2 className="title">Dashboard Operativo</h2>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <AlertTriangle size={20} />
                    <strong>Error de Sistema</strong>
                </div>
                {error}
                <button onClick={loadDashboard} className="btn" style={{ marginLeft: '15px', backgroundColor: '#EF4444', color: 'white', border: 'none' }}>Reintentar</button>
            </div>
        </div>
    );
  }

  if (!data) return null;

  const showGlobalData = can(me, PERMISSIONS.DASHBOARD_VIEW);
  // Nota: tecnico_terreno, qa y logistica nunca llegan aqui (redirigen a sus propias rutas)

  // PREPARACIÓN DE DATOS PARA GRÁFICOS
  const pieChartData = [
    { name: 'Consolas', value: data.kpis.consolasEnLab, color: COLOR_CONSOLA },
    { name: 'Validadores', value: data.kpis.validadoresEnLab, color: COLOR_VALIDADOR }
  ];

  const hasDataInLab = data.kpis.totalEnProceso > 0;

  // ESTILO PARA TOOLTIPS (AJUSTADO)
  // Se cambia el fondo de blanco puro (#ffffff) a un gris muy claro (#f9fafb)
  // para mejorar la diferenciación en modo claro sin afectar el contraste.
  const tooltipStyle = {
    backgroundColor: '#f9fafb', // <--- CAMBIO AQUÍ (Gris sutil)
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    color: '#1f2937', // Texto oscuro
    padding: '8px 12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', // Sombra más suave
    fontSize: '0.9rem',
    fontWeight: 500
  };

  return (
    <div className="panel animate-fade-in">
      <ReadOnlyNotice me={me} />
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="title" style={{ marginBottom: '5px' }}>Dashboard Operativo</h2>
          <p className="muted" style={{ margin: 0 }}>Bienvenido, <strong>{me?.nombre ?? "Usuario"}</strong></p>
        </div>
        <button onClick={loadDashboard} className="btn ghost" title="Actualizar datos" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> <span className="hide-mobile">Actualizar</span>
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid" style={{ gap: '20px', marginBottom: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        {/* KPI: En Tránsito */}
        {showGlobalData && (
        <div 
          className="card kpi interactive" 
          onClick={() => navigate("/bodega")}
          style={{ borderLeft: '4px solid #F59E0B', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', cursor: 'pointer' }}
        >
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>En Tránsito</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalEnTransito ?? 0}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>Desde Terreno / Lab</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '14px' }}>
            <RefreshCw size={28} color="#F59E0B" />
          </div>
        </div>
        )}

        {/* KPI: En Bodega */}
        {showGlobalData && (
        <div 
          className="card kpi interactive" 
          onClick={() => navigate("/bodega")}
          style={{ borderLeft: '4px solid #10B981', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', cursor: 'pointer' }}
        >
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>En Bodega</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalEnBodega ?? 0}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>Stock por Clasificar</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px' }}>
            <Archive size={28} color="#10B981" />
          </div>
        </div>
        )}

        {/* KPI: OS Activas Lab */}
        {showGlobalData && (
        <div 
          className="card kpi interactive" 
          onClick={() => navigate("/admin/despacho")}
          style={{ borderLeft: '4px solid #3B82F6', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', cursor: 'pointer' }}
        >
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>OS Activas Lab</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalEnProceso}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>
              {data.kpis.consolasEnLab} Consolas | {data.kpis.validadoresEnLab} Val.
            </div>
            <div className="small font-bold" style={{ color: '#10B981', marginTop: '4px' }}>
              {data.kpis.totalReparadosLab} Listos para enviar
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px' }}>
            <Wrench size={28} color="#3B82F6" />
          </div>
        </div>
        )}

        {/* KPI: Equipos Disponibles */}
        {showGlobalData && (
        <div className="card kpi" style={{ borderLeft: '4px solid #10B981', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Disponibles</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalReparados}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>Listos en Bodega/Pañol</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px' }}>
            <CheckCircle size={28} color="#10B981" />
          </div>
        </div>
        )}

        {/* KPI: Operativos */}
        {showGlobalData && (
        <div className="card kpi" style={{ borderLeft: '4px solid #06B6D4', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Operativos</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalOperativos}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>Funcionando OK</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderRadius: '14px' }}>
            <Bus size={28} color="#06B6D4" />
          </div>
        </div>
        )}

        {/* KPI: PODs */}
        {showGlobalData && (
        <div className="card kpi" style={{ borderLeft: '4px solid #EC4899', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>PODs Totales</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalPods}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>
              {data.kpis.podsReparados} Reparados
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '14px' }}>
            <Cpu size={28} color="#EC4899" />
          </div>
        </div>
        )}

        {/* KPI: Pendientes QA */}
        {showGlobalData && (
        <div 
          className="card kpi interactive" 
          onClick={() => navigate("/qa")}
          style={{ borderLeft: '4px solid #8B5CF6', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', cursor: 'pointer' }}
        >
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Pendientes QA</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.totalEnQa ?? 0}</div>
            <div className="small muted" style={{ marginTop: '8px' }}>Por certificar</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '14px' }}>
            <Microscope size={28} color="#8B5CF6" />
          </div>
        </div>
        )}

        {/* KPI: SLA / Tiempo Promedio */}
        {showGlobalData && (
        <div 
          className="card kpi" 
          style={{ borderLeft: '4px solid #F43F5E', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}
        >
          <div>
            <div className="small muted" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Tiempo Promedio (SLA)</div>
            <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data.kpis.tiempoPromedio ?? 0}h</div>
            <div className="small muted" style={{ marginTop: '8px' }}>Resolución Taller</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: '14px' }}>
            <Clock size={28} color="#F43F5E" />
          </div>
        </div>
        )}
      </div>

      {/* GRÁFICOS Y ANÁLISIS IA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Gráfico de Barras: Estado de la Flota (solo Admin/Jefe) */}
        {showGlobalData && (
        <div className="card" style={{ padding: '24px', minHeight: '400px' }}>
          <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Estado de la Flota</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted, #9CA3AF)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="var(--text-muted, #9CA3AF)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#1f2937' }}
                />
                <Bar dataKey="cantidad" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50}>
                    {
                        data.charts.barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : (index === 1 ? '#EF4444' : '#F59E0B')} />
                        ))
                    }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Gráfico de Torta: Detalle Taller */}
        {showGlobalData && (
        <div className="card" style={{ padding: '24px', minHeight: '400px' }}>
          <h3 className="title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Detalle Equipos en Laboratorio</h3>
          {!hasDataInLab ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="muted">
                  <div style={{ textAlign: 'center' }}>
                      <CheckCircle size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p>Sin equipos en laboratorio</p>
                  </div>
              </div>
          ) : (
              <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                  <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                  >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    align="center"
                  />
                  </PieChart>
              </ResponsiveContainer>
              </div>
          )}
        </div>
        )}

        {/* INTEGRACIÓN DE IA EN EL DASHBOARD */}
        {showGlobalData && (
          <AIRiskPanel />
        )}
      </div>

    </div>
  );
}
