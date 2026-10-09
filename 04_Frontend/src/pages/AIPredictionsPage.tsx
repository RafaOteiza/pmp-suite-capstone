import { useOutletContext } from "react-router-dom";
import { Brain, Cpu, Info, ShieldCheck, TrendingUp } from "lucide-react";
import type { Me } from "../api/me";
import AIRiskPanel from "../components/AIRiskPanel";
import ReadOnlyNotice from "../components/ReadOnlyNotice";
import PageHeader from "../components/ui/PageHeader";

export default function AIPredictionsPage() {
  const me = useOutletContext<Me | null>();
  return (
    <div className="page">
      <ReadOnlyNotice me={me} />
      <PageHeader eyebrow="Inteligencia operacional" title="Estrategia predictiva IA" description="Análisis de reincidencia sobre datos operacionales de PostgreSQL" icon={<Brain size={21} />} />

      <div className="ai-page-grid">
        <div className="ai-page-main">
          <AIRiskPanel />
          <section className="panel">
            <div className="section-heading"><h2 className="section-title"><TrendingUp size={19} /> Criterios analizados</h2></div>
            <div className="insight-grid">
              <div className="insight-card">
                <p className="muted">El análisis actual prioriza la reincidencia histórica y la presencia de fallas EMV en las órdenes registradas.</p>
                <div className="toolbar-group"><span className="status-badge" data-tone="primary">Historial de OS</span><span className="status-badge" data-tone="primary">Reincidencia</span><span className="status-badge" data-tone="primary">Patrón EMV</span></div>
              </div>
              <div className="metric-stack"><div><span>Fuente analizada</span><strong>Órdenes de servicio</strong></div><div><span>Tipo de ejecución</span><strong>Bajo demanda</strong></div></div>
            </div>
          </section>
        </div>

        <aside className="ai-page-aside">
          <section className="panel inference-card">
            <h2 className="section-title"><Cpu size={18} /> Motor de inferencia</h2>
            <dl className="definition-list"><div><dt>Análisis</dt><dd>Heurística de reincidencia</dd></div><div><dt>Entrada</dt><dd>Datos PostgreSQL</dd></div><div><dt>Ejecución</dt><dd>Al abrir la vista</dd></div></dl>
          </section>
          <section className="criteria-card"><div><Info size={18} /><strong>Criterio de inspección</strong></div><p>Los porcentajes ayudan a priorizar equipos para inspección preventiva y deben complementarse con revisión técnica.</p></section>
          <div className="audit-note"><ShieldCheck size={16} /> Consulta de solo lectura sobre datos PMP Suite</div>
        </aside>
      </div>
    </div>
  );
}
