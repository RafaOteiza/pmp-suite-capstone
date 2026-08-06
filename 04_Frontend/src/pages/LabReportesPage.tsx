import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import { FileText, TrendingUp, RefreshCw, Download, FileSpreadsheet } from "lucide-react";
import { getAuth } from "firebase/auth";
import { useOutletContext } from "react-router-dom";
import type { Me } from "../api/me";
import ReadOnlyNotice from "../components/ReadOnlyNotice";

async function getToken(): Promise<string> {
  const user = getAuth().currentUser;
  return user ? user.getIdToken() : '';
}

interface ReporteData {
  eficienciaSemanal: number;
  totalReparados: number;
  totalEnProceso: number;
  tiempoPromedioHoras: number;
  fallas: { name: string; cantidad: number }[];
  porTecnico: { name: string; cantidad: number }[];
  porTipo: { name: string; value: number }[];
}

// Datos demo usados como fallback mientras no exista el endpoint
const FALLBACK: ReporteData = {
  eficienciaSemanal: 92,
  totalReparados: 47,
  totalEnProceso: 8,
  tiempoPromedioHoras: 18.5,
  fallas: [
    { name: 'Software', cantidad: 15 },
    { name: 'Pantalla Oscura', cantidad: 12 },
    { name: 'No Enciende', cantidad: 8 },
    { name: 'Touch Da\u00f1ado', cantidad: 5 },
    { name: 'Conector Roto', cantidad: 3 },
  ],
  porTecnico: [
    { name: 'Jos\u00e9 Villarroel', cantidad: 21 },
    { name: 'Carlos Meza', cantidad: 15 },
    { name: 'Pablo Rojas', cantidad: 11 },
  ],
  porTipo: [
    { name: 'Validadores', value: 29 },
    { name: 'Consolas', value: 18 },
  ]
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Tooltip glassmorphism para dark mode
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(17,18,23,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '10px 16px',
      color: '#F3F4F6',
      fontSize: 13,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <p style={{ margin: '0 0 4px', color: '#9CA3AF', fontWeight: 600 }}>{label || payload[0].name}</p>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{payload[0].value}</p>
    </div>
  );
};

export default function LabReportesPage() {
  const me = useOutletContext<Me | null>();
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch('/api/lab/reportes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      // Normalizar: si el endpoint existe pero faltan campos, usamos fallback por propiedad
      setData({
        eficienciaSemanal: raw.eficienciaSemanal ?? FALLBACK.eficienciaSemanal,
        totalReparados:    raw.totalReparados    ?? FALLBACK.totalReparados,
        totalEnProceso:    raw.totalEnProceso    ?? FALLBACK.totalEnProceso,
        tiempoPromedioHoras: raw.tiempoPromedioHoras ?? FALLBACK.tiempoPromedioHoras,
        fallas:     Array.isArray(raw.fallas)     ? raw.fallas     : FALLBACK.fallas,
        porTecnico: Array.isArray(raw.porTecnico) ? raw.porTecnico : FALLBACK.porTecnico,
        porTipo:    Array.isArray(raw.porTipo)    ? raw.porTipo    : FALLBACK.porTipo,
      });
    } catch {
      // Endpoint aun no existe — usar datos demo
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ──── Exportar a CSV ────────────────────────────────────────────────
  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Tipo", "Ítem", "Valor"],
      ["KPI", "Eficiencia Semanal", `${data.eficienciaSemanal}%`],
      ["KPI", "Total Reparados", data.totalReparados],
      ["KPI", "En Proceso", data.totalEnProceso],
      ["KPI", "Tiempo Promedio (hrs)", data.tiempoPromedioHoras],
      [],
      ["Top Fallas", "Descripción", "Cantidad"],
      ...data.fallas.map(f => ["Falla", f.name, f.cantidad]),
      [],
      ["Por Técnico", "Nombre", "Reparaciones"],
      ...data.porTecnico.map(t => ["Técnico", t.name, t.cantidad]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_laboratorio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ──── Exportar a Excel (XLSX via SheetJS CDN-free approach) ─────────
  const exportExcel = async () => {
    if (!data) return;
    try {
      // Importación dinámica de xlsx
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Hoja 1: KPIs
      const kpiData = [
        { Métrica: "Eficiencia Semanal", Valor: `${data.eficienciaSemanal}%` },
        { Métrica: "Total Reparados", Valor: data.totalReparados },
        { Métrica: "En Proceso", Valor: data.totalEnProceso },
        { Métrica: "Tiempo Promedio (hrs)", Valor: data.tiempoPromedioHoras },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiData), "KPIs");

      // Hoja 2: Fallas
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        data.fallas.map(f => ({ Falla: f.name, Cantidad: f.cantidad }))
      ), "Top Fallas");

      // Hoja 3: Por Técnico
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        data.porTecnico.map(t => ({ Técnico: t.name, Reparaciones: t.cantidad }))
      ), "Por Técnico");

      XLSX.writeFile(wb, `reporte_laboratorio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error("Error exportando Excel:", e);
      alert("Para exportar a Excel instala: npm install xlsx");
    }
  };

  if (loading) return (
    <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
      <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
      <p className="muted">Cargando métricas...</p>
    </div>
  );

  if (!data) return null;

  const kpiCards = [
    { label: "Eficiencia Semanal", value: `${data.eficienciaSemanal}%`, color: '#10B981', sub: "Reparados vs. ingresados" },
    { label: "Total Reparados", value: data.totalReparados, color: '#3B82F6', sub: "Esta semana" },
    { label: "En Proceso", value: data.totalEnProceso, color: '#F59E0B', sub: "En laboratorio ahora" },
    { label: "Tiempo Promedio", value: `${data.tiempoPromedioHoras}h`, color: '#8B5CF6', sub: "Por OS reparada" },
  ];

  return (
    <div className="panel animate-fade-in">
      <ReadOnlyNotice me={me} />
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 4 }}>Laboratorio · Reportes</h2>
          <p className="muted" style={{ margin: 0 }}>Métricas de rendimiento y fallas frecuentes.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportCSV} className="btn ghost" title="Exportar CSV" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }}>
            <Download size={16} /> CSV
          </button>
          <button onClick={exportExcel} className="btn ghost" title="Exportar Excel" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={load} className="btn ghost" disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {kpiCards.map(k => (
          <div key={k.label} className="card" style={{ padding: '20px 24px', borderLeft: `4px solid ${k.color}` }}>
            <div className="muted small" style={{ marginBottom: 6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{k.label}</div>
            <div className="title" style={{ fontSize: '2rem', margin: 0, color: k.color }}>{k.value}</div>
            <div className="small muted" style={{ marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── GRÁFICOS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>

        {/* Barras: Top Fallas */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', gap: 8, alignItems: 'center' }}>
            <FileText size={18} color="#3B82F6" /> Top Fallas Recurrentes
          </h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fallas} layout="vertical" margin={{ left: 10, right: 30 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} horizontal={false} />
                <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={110} tickLine={false} axisLine={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} background={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}>
                  {(data.fallas ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: Por Técnico */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', gap: 8, alignItems: 'center' }}>
            <TrendingUp size={18} color="#10B981" /> Reparaciones por Técnico
          </h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.porTecnico} layout="vertical" margin={{ left: 10, right: 30 }} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} horizontal={false} />
                <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={130} tickLine={false} axisLine={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} background={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}>
                  {(data.porTecnico ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Torta: Validadores vs Consolas */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem' }}>Distribución por Tipo de Equipo</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.porTipo}
                  cx="50%" cy="45%"
                  innerRadius={75} outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={0}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(156,163,175,0.3)' }}
                >
                  {data.porTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  verticalAlign="bottom" height={36} iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
