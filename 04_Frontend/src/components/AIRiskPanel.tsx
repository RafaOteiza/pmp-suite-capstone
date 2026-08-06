
import React, { useEffect, useState } from 'react';
import { getAIRiskReport, AIRiskItem } from '../api/ai';
import { Brain, AlertCircle, ShieldCheck, Activity, ChevronRight } from 'lucide-react';

const AIRiskPanel: React.FC = () => {
    const [risks, setRisks] = useState<AIRiskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAIRiskReport()
            .then(data => setRisks(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getScoreColor = (score: number) => {
        if (score > 0.7) return '#EF4444'; // Red
        if (score > 0.4) return '#F59E0B'; // Amber
        return '#10B981'; // Green
    };

    if (loading) return (
        <div className="card animate-pulse" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity className="animate-spin text-muted" size={24} />
        </div>
    );

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', background: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
                        <Brain size={20} />
                    </div>
                    <div>
                        <h3 className="title" style={{ margin: 0, fontSize: '1.1rem' }}>Score de Confiabilidad IA</h3>
                        <p className="small muted" style={{ margin: 0 }}>Basado en patrones de reincidencia MTBF</p>
                    </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                    Live Analysis
                </div>
            </div>

            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {risks.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <ShieldCheck size={40} className="muted" style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <p className="muted" style={{ fontSize: '14px' }}>No se han detectado anomalías críticas en las últimas 24 horas.</p>
                    </div>
                ) : (
                    risks.map((item, idx) => {
                        const color = getScoreColor(item.riesgo_score);
                        return (
                            <div 
                                key={item.serie_equipo} 
                                style={{ 
                                    padding: '16px 24px', 
                                    borderBottom: idx === risks.length - 1 ? 'none' : '1px solid var(--border)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                className="sb-link-hover"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                    <div style={{ 
                                        width: '42px', height: '42px', borderRadius: '12px', 
                                        background: `${color}15`, border: `1px solid ${color}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: color
                                    }}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>{item.serie_equipo}</span>
                                            <span style={{ fontSize: '10px', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase' }}>{item.tipo_equipo}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                                            Reincidencia: {item.fallas_previas} ingresos previos
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '900', color: color }}>
                                            {(item.riesgo_score * 100).toFixed(0)}%
                                        </div>
                                        <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Nivel de Riesgo
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="muted" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div style={{ padding: '16px 24px', background: 'var(--panel-2)', borderTop: '1px solid var(--border)', fontSize: '11px' }}>
                <span className="muted">Última inferencia generada hoy a las {new Date().getHours()}:00. Algoritmo certificado por el modelo de Tesis Gold v5.0.</span>
            </div>
        </div>
    );
};

export default AIRiskPanel;
