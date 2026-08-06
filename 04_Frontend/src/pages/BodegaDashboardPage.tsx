import React, { useEffect, useState } from "react";
import { getBodegaDashboard, BodegaDashboardData } from "../api/bodega";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from "recharts";
import { LayoutDashboard, Truck, AlertTriangle, RefreshCw, PieChart as PieChartIcon, Brain } from "lucide-react";
import AIRiskPanel from "../components/AIRiskPanel";
import { useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import ReadOnlyNotice from "../components/ReadOnlyNotice";

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#14B8A6'];

export default function BodegaDashboardPage() {
    const me = useOutletContext<Me | null>();
    const [data, setData] = useState<BodegaDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try { setData(await getBodegaDashboard()); } 
        catch (e: any) { 
            console.error(e); 
            setError(e.response?.data?.error || e.message || "Error al cargar dashboard");
        } 
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><RefreshCw className="animate-spin text-muted" size={32}/></div>;
    if (error) return <div style={{ padding: '40px', color: '#EF4444', textAlign: 'center' }}>Error: {error}</div>;
    if (!data) return null;

    const filtrado = data?.distribucionEstados?.filter(d => d.value > 0).sort((a,b) => b.value - a.value) || [];

    // Custom Tooltip premium (Glassmorphism)
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(20, 20, 20, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    color: '#fff',
                    zIndex: 1000
                }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', color: '#E5E7EB' }}>
                        {label || payload[0]?.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: payload[0].payload.fill || payload[0].color || COLORS[0] }} />
                        <span style={{ fontSize: '15px', color: '#D1D5DB' }}>
                            Cantidad: <b style={{ fontSize: '17px', color: '#fff', marginLeft: '4px' }}>{payload[0].value}</b>
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-fade-in">
            <ReadOnlyNotice me={me} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Dashboard Logístico</h2>
                    <p className="muted" style={{ margin: 0 }}>Visión general del estado del equipamiento físico en la red.</p>
                </div>
                <button onClick={load} className="btn ghost" disabled={loading}>
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10B981' }}>
                    <div>
                        <div className="muted small" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>TOTAL EQUIPOS</div>
                        <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data?.distribucionEstados?.reduce((acc, curr) => acc + curr.value, 0) || 0}</div>
                        <div className="small muted" style={{ marginTop: '8px' }}>En el sistema</div>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <LayoutDashboard size={28} color="#10B981" />
                    </div>
                </div>
                
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #3B82F6' }}>
                    <div>
                        <div className="muted small" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>EQUIPOS EN RUTA</div>
                        <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{data?.equiposEnRuta || 0}</div>
                        <div className="small muted" style={{ marginTop: '8px' }}>Operativos reportados</div>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <Truck size={28} color="#3B82F6" />
                    </div>
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: (data?.alertasStock || 0) > 0 ? '4px solid #EF4444' : '4px solid #10B981' }}>
                    <div>
                        <div className="muted small" style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>ALERTA STOCK</div>
                        <div className="title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1, color: (data?.alertasStock || 0) > 0 ? '#EF4444' : 'inherit' }}>{data?.alertasStock || 0}</div>
                        <div className="small muted" style={{ marginTop: '8px' }}>Repuestos críticos</div>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '14px', background: (data?.alertasStock || 0) > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                        <AlertTriangle size={28} color={(data?.alertasStock || 0) > 0 ? '#EF4444' : '#10B981'} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                
                {/* GRAFICO BARRAS */}
                <div className="card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', marginBottom: '10px' }}>
                        <LayoutDashboard size={22} color="#8B5CF6"/>
                        <h3 className="title" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Distribución General por Estado</h3>
                    </div>
                    {/* Altura dinámica dependiendo de la cantidad de barras, para evitar barras gigantes si hay solo 1 */}
                    <div style={{ height: Math.max(250, filtrado.length * 60) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filtrado} layout="vertical" margin={{ top: 10, right: 50, left: 10, bottom: 5 }} barSize={18}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={1}/>
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={160} tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                
                                <Bar 
                                    dataKey="value" 
                                    radius={[0, 8, 8, 0]} 
                                    fill="url(#colorBar)" 
                                    background={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                                    activeBar={{ stroke: '#fff', strokeWidth: 1 }}
                                >
                                    {filtrado.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="right" fill="var(--text-main)" fontSize={14} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* GRAFICO TORTA - Diseño Simplificado y Elegante */}
                <div className="card" style={{ padding: '24px', minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                        <PieChartIcon size={22} color="#EC4899"/>
                        <h3 className="title" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Participación en Fases</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={filtrado}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={85}
                                    outerRadius={120}
                                    paddingAngle={filtrado.length > 1 ? 3 : 0}
                                    dataKey="value"
                                    stroke="var(--card)"
                                    strokeWidth={4}
                                    cornerRadius={10}
                                    // Removemos labels externos para limpiar la vista
                                    label={false}
                                    labelLine={false}
                                >
                                    {filtrado.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>

                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                    <tspan x="50%" dy="-5" fontSize="36" fontWeight="800" fill="var(--text-main)">
                                        {filtrado.reduce((acc, curr) => acc + curr.value, 0)}
                                    </tspan>
                                    <tspan x="50%" dy="26" fontSize="12" fill="var(--muted)" fontWeight="bold" letterSpacing="1px">
                                        EQUIPOS TOTALES
                                    </tspan>
                                </text>

                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    layout="horizontal"
                                    verticalAlign="bottom" 
                                    align="center"
                                    iconType="circle" 
                                    wrapperStyle={{ fontSize: '12px', color: 'var(--text-main)', paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                </div>
            </div>
            
            {/* Score de IA integrado en el flujo visual */}
            <AIRiskPanel />
        </div>
    </div>
);
}
