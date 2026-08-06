import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Cpu, Monitor } from "lucide-react";
import { toggleTheme } from "../app/theme";
import { fbAuth } from "../app/firebase";
import { signOut } from "firebase/auth";
import { Me } from "../api/me";
import { api } from "../api/http";
import { useSession } from "../app/SessionContext";

export default function TopBar({ me }: { me: Me | null }) {
  const { endSession } = useSession();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/api/dashboard/global-search?q=${query}`);
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) { }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const logout = async () => {
    try {
      await signOut(fbAuth);
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
    endSession();
    nav("/login");
  };

  const displayName = useMemo(() => {
    if (!me) return "Sesión";
    const full = `${me.nombre ?? ""} ${me.apellido ?? ""}`.trim();
    return full || me.correo || "Sesión";
  }, [me]);

  const isDark = (document.documentElement.getAttribute("data-theme") || "dark") === "dark";

  return (
    <div className="topbar">
      <div className="search" style={{ position: 'relative' }}>
        <span>⌕</span>
        <input 
          placeholder="Buscar OS / Aranda / Ticket..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
            background: 'var(--panel)', border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            maxHeight: 400, overflowY: 'auto'
          }}>
            {results.length === 0 ? (
              <div style={{ padding: 15, textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>Sin resultados para "{query}"</div>
            ) : (
              results.map(r => (
                <div key={r.codigo_os} style={{ padding: '12px 15px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer' }} className="hover-bg">
                  <div style={{ padding: 8, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', borderRadius: 8 }}>
                    {r.tipo_equipo === 'VALIDADOR' ? <Cpu size={18}/> : <Monitor size={18}/>}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{r.codigo_os}</strong>
                      {r.ticket_aranda && <span style={{ color: '#10B981', fontWeight: 'bold' }}>Aranda: {r.ticket_aranda}</span>}
                    </div>
                    <div className="muted small" style={{ marginTop: 2 }}>Serie: {r.serie || 'N/A'} • Téc: {r.tecnico_creador || 'ND'}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: 8, display: 'flex', gap: 8 }}>
                      <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>{r.estado}</span>
                      <span className="muted">{r.ubicacion}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="session-name">{displayName}</div>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn ghost" onClick={logout}>Salir</button>
      </div>
    </div>
  );
}
