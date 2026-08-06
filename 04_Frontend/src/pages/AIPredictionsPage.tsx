
import React from 'react';
import AIRiskPanel from '../components/AIRiskPanel';
import { Brain, Cpu, TrendingUp, Info, Activity, ShieldCheck } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import type { Me } from '../api/me';
import ReadOnlyNotice from '../components/ReadOnlyNotice';

const AIPredictionsPage: React.FC = () => {
    const me = useOutletContext<Me | null>();
    return (
        <div className="animate-fade-in" style={{ padding: '20px' }}>
            <ReadOnlyNotice me={me} />
            {/* Cabecera Refinada */}
            <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                        width: '64px', height: '64px', borderRadius: '18px', 
                        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
                    }}>
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="title" style={{ fontSize: '2.2rem', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Estrategia Predictiva IA</h1>
                        <p className="muted" style={{ fontSize: '1.1rem', margin: 0 }}>Análisis de ciclo de vida y prevención de reincidencias v5.0</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
                {/* COLUMNA IZQUIERDA: DATOS DUROS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* El Panel de Riesgo ahora es central */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <AIRiskPanel />
                    </div>

                    {/* Sección de Tendencias con diseño de Dashboard Moderno */}
                    <div className="card" style={{ padding: '30px', background: 'var(--panel)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <TrendingUp className="w-6 h-6 text-indigo-500" />
                            <h3 className="title" style={{ margin: 0, fontSize: '1.3rem' }}>Correlaciones Detectadas</h3>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.5' }}>
                                    Existe una correlación directa entre fallas **EMV** y bus de red en equipos con:
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['+3 Años', 'Uso Intenso', 'Puerto RS232'].map(tag => (
                                        <span key={tag} style={{ padding: '4px 12px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
                                    <span className="muted" style={{ fontSize: '13px' }}>MTBF Estimado</span>
                                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>42 Días</span>
                                </div>
                                <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
                                    <span className="muted" style={{ fontSize: '13px' }}>Confianza Algoritmo</span>
                                    <span style={{ fontWeight: '800', color: 'var(--green)' }}>91.4%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: INSIGHTS Y AUDITORÍA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div className="card shadow-lg" style={{ padding: '24px', background: 'linear-gradient(to bottom, var(--card), var(--bg))' }}>
                        <h4 className="title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <Cpu className="w-4 h-4 text-indigo-500" />
                            Motor de Inferencia
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { title: 'Pipeline', desc: 'Random Forest Regressor' },
                                { title: 'Input', desc: 'PostgreSQL Stream' },
                                { title: 'Frecuencia', desc: 'Auto-retrain 24h' }
                            ].map(item => (
                                <div key={item.title} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>{item.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ 
                        padding: '24px', borderRadius: '24px', 
                        background: 'rgba(245, 158, 11, 0.05)', 
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--yellow)', fontWeight: '800', fontSize: '13px' }}>
                            <Info className="w-5 h-5" />
                            CRITERIO DE INSPECCIÓN
                        </div>
                        <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            Si un activo supera el **85% de riesgo**, se recomienda el retiro preventivo del equipo en su próximo paso por cabecera, evitando el costo de una falla en ruta.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', color: 'var(--muted)', fontSize: '11px', textAlign: 'center', justifyContent: 'center' }}>
                        <ShieldCheck className="w-4 h-4" />
                        Auditoría de Datos pmp_suite v5.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPredictionsPage;
