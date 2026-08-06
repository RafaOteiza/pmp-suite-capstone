import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setToken } from "../app/token";
import { useSession } from "../app/SessionContext";
import { Mail, Lock, LogIn, AlertCircle, Cpu } from "lucide-react"; // Importamos iconos

export default function LoginPage() {
  const nav = useNavigate();
  // Verificar sesión existente
  const { status, refreshSession } = useSession();
    // Redirección asíncrona para evitar warnings de React durante el render
  // La redirección ocurre sólo después de confirmar /api/auth/me.

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") nav("/", { replace: true });
  }, [status, nav]);

  if (status === "loading") {
    return <main role="status" aria-live="polite" aria-busy="true" style={{ padding: 40 }}>Verificando sesión…</main>;
  }

  if (status === "authenticated") return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await login({ email, password });
      setToken(res.token);
      const confirmed = await refreshSession();
      if (!confirmed) throw new Error("La cuenta no está habilitada en PMP Suite");
      nav("/");
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? ex?.message ?? "Credenciales incorrectas");
    } finally {
      setBusy(false);
    }
  };

  // Estilos Inline para garantizar el look sin depender de tu CSS global actual
  const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a', // Fondo muy oscuro (Slate 900)
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)' // Sutil gradiente superior
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        backgroundColor: '#1f2937', // Gris oscuro (igual que tus cards del dashboard)
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    inputGroup: {
        position: 'relative' as 'relative',
        marginBottom: '20px'
    },
    inputIcon: {
        position: 'absolute' as 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none' as 'none'
    },
    input: {
        width: '100%',
        padding: '12px 12px 12px 45px', // Padding izquierdo extra para el icono
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: '8px',
        color: 'white',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#F59E0B', // Amarillo corporativo PMP (o usa #3B82F6 para Azul)
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.7 : 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-fade-in">
        
        {/* Header con Logo Simulado */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
                display: 'inline-flex', 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                marginBottom: '15px' 
            }}>
                <Cpu size={40} color="#F59E0B" />
            </div>
            <h1 className="title" style={{ fontSize: '1.8rem', color: 'white', margin: '0 0 5px 0' }}>
                PMP Suite
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                Gestión Inteligente de Flota
            </p>
        </div>

        <form onSubmit={onSubmit}>
          
          {/* Input Email */}
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input 
                style={styles.input} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="correo@pmp-suite.cl"
                type="email"
                required
            />
          </div>

          {/* Input Password */}
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Mensaje de Error */}
          {err && (
            <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#EF4444', 
                padding: '10px', 
                borderRadius: '6px', 
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <AlertCircle size={16} />
                {err}
            </div>
          )}

          <button 
            type="submit" 
            style={styles.button}
            disabled={busy}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(110%)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(100%)'}
          >
            {busy ? (
                <>Ingresando...</>
            ) : (
                <>Ingresar <LogIn size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <p className="small muted" style={{ fontSize: '0.75rem' }}>
                © 2025 PMP Suite v8.9. Acceso restringido.
            </p>
        </div>
      </div>
    </div>
  );
}
