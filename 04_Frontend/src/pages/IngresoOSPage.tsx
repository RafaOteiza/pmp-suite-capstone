import React, { useState } from "react";
import { createOS } from "../api/os";
import { 
  ClipboardList, Bus, Hash, AlertTriangle, 
  Camera, CheckCircle, Monitor, Cpu, Plus, X 
} from "lucide-react";

// --- ESTILOS VISUALES ---
const labelWithIconStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '6px',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: 'var(--text-muted, #9CA3AF)'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: 'var(--bg-input, #111827)', 
  border: '1px solid var(--border-color, #374151)',
  borderRadius: '8px',
  color: 'var(--text-main, white)',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontSize: '0.95rem'
};

const cardSelectorStyle = (selected: boolean, color: string) => ({
    padding: '20px', 
    borderRadius: '12px', 
    cursor: 'pointer',
    border: selected ? `2px solid ${color}` : '1px solid var(--border-color, #374151)',
    backgroundColor: selected ? `${color}15` : 'transparent', // 15% opacidad del color
    textAlign: 'center' as 'center', 
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    gap: '10px'
});

export default function IngresoOSPage() {
  const [tipo, setTipo] = useState<"VALIDADOR" | "CONSOLA">("VALIDADOR");
  const [esPod, setEsPod] = useState(false);
  const [ppu, setPpu] = useState("");
  const [serie, setSerie] = useState("");
  const [falla, setFalla] = useState("");
  const [foto, setFoto] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success'|'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      await createOS({
        tipo,
        es_pod: esPod,
        bus_ppu: ppu.toUpperCase(),
        serie_equipo: serie,
        falla,
        foto_dano_url: esPod ? foto : undefined,
        // En un futuro estos campos podrían venir de un select de modelos reales
        modelo: 'Generico', 
        marca: 'Generico'
      });

      setMsg({ text: "Orden de Servicio creada exitosamente", type: 'success' });
      // Limpiar formulario para el siguiente ingreso
      setPpu(""); setSerie(""); setFalla(""); setFoto("");
    } catch (ex: any) {
      setMsg({ text: ex.response?.data?.error || "Error al crear OS", type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h2 className="title" style={{ fontSize: '2rem', marginBottom: '5px' }}>Ingreso de OS</h2>
        <p className="muted">Reporte de fallas en terreno.</p>
      </div>

      {/* NOTIFICACIONES */}
      {msg && (
        <div style={{ 
            padding: '15px', borderRadius: '8px', marginBottom: 20, 
            backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: msg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: msg.type === 'success' ? '#10B981' : '#EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 500
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                {msg.text}
            </div>
            <button onClick={() => setMsg(null)} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}><X size={18}/></button>
        </div>
      )}

      {/* FORMULARIO */}
      {/* Usamos className="card" para adaptabilidad al tema */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '30px' }}>
        
        {/* 1. SELECCIÓN DE TIPO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25 }}>
            <div 
                onClick={() => setTipo("VALIDADOR")}
                style={cardSelectorStyle(tipo === "VALIDADOR", '#10B981')}
            >
                <Cpu size={32} color={tipo === "VALIDADOR" ? '#10B981' : 'gray'} />
                <div style={{fontWeight: 600, color: tipo === "VALIDADOR" ? '#10B981' : 'gray'}}>Validador</div>
            </div>

            <div 
                onClick={() => setTipo("CONSOLA")}
                style={cardSelectorStyle(tipo === "CONSOLA", '#3B82F6')}
            >
                <Monitor size={32} color={tipo === "CONSOLA" ? '#3B82F6' : 'gray'} />
                <div style={{fontWeight: 600, color: tipo === "CONSOLA" ? '#3B82F6' : 'gray'}}>Consola</div>
            </div>
        </div>

        {/* 2. DATOS DEL EQUIPO Y BUS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
            <div>
                <label style={labelWithIconStyle}><Bus size={16}/> Patente Bus (PPU)</label>
                <input 
                    style={inputStyle} 
                    value={ppu} 
                    onChange={e => setPpu(e.target.value.toUpperCase())} 
                    placeholder="Ej: FLXR12" 
                    required 
                    maxLength={6} 
                />
            </div>
            <div>
                <label style={labelWithIconStyle}><Hash size={16}/> Serie del Equipo</label>
                <input 
                    style={inputStyle} 
                    value={serie} 
                    onChange={e => setSerie(e.target.value)} 
                    placeholder="Ej: 74000123" 
                    required 
                />
            </div>
        </div>

        {/* 3. DESCRIPCIÓN DE LA FALLA */}
        <div style={{ marginBottom: 25 }}>
            <label style={labelWithIconStyle}><ClipboardList size={16}/> Descripción de la Falla</label>
            <textarea 
                style={{...inputStyle, height: '100px', resize: 'none', fontFamily: 'inherit', lineHeight: '1.5'}} 
                value={falla} 
                onChange={e => setFalla(e.target.value)} 
                placeholder="Describe el problema técnico detectado..." 
                required 
            />
        </div>

        {/* 4. ZONA POD (VANDALISMO) */}
        <div style={{ 
            padding: '15px', 
            backgroundColor: 'rgba(128, 128, 128, 0.05)', 
            border: '1px solid var(--border-color, #374151)',
            borderRadius: '8px', 
            marginBottom: 25 
        }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: esPod ? '15px' : '0' }}>
                <input 
                    type="checkbox" 
                    checked={esPod} 
                    onChange={e => setEsPod(e.target.checked)} 
                    style={{ width: 18, height: 18, cursor: 'pointer' }} 
                />
                <span style={{ fontWeight: 600, color: esPod ? '#F59E0B' : 'inherit' }}>
                    Reportar como Vandalismo (POD)
                </span>
            </label>

            {esPod && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <label style={labelWithIconStyle}><Camera size={16}/> URL Foto Daño (Obligatorio)</label>
                    <input 
                        style={inputStyle} 
                        value={foto} 
                        onChange={e => setFoto(e.target.value)} 
                        placeholder="https://..." 
                        required={esPod} 
                    />
                    <p style={{fontSize: '0.8rem', color: '#6B7280', marginTop: 5}}>
                        * Debes adjuntar evidencia fotográfica para procesar el POD.
                    </p>
                </div>
            )}
        </div>

        {/* 5. BOTÓN DE ACCIÓN */}
        <button 
            type="submit" 
            disabled={busy}
            className="btn"
            style={{ 
                width: '100%', padding: '14px', fontSize: '1.1rem', 
                backgroundColor: '#F59E0B', border: 'none', color: 'white', fontWeight: 'bold',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 
            }}
        >
            {busy ? 'Procesando...' : <><Plus size={20} /> Crear Orden de Servicio</>}
        </button>

      </form>
    </div>
  );
}