import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import type { Me } from "../api/me";
import { getBadgeCounts, type BadgeCounts } from "../api/badges";
import { can, isReadOnlyRole, PERMISSIONS, ROLES } from "../app/rbac";
import {
  Brain, CheckCircle, Cpu, FileBarChart, LayoutDashboard, Monitor,
  Package, PlusSquare, Search, Settings, ShieldCheck, Users, Wrench
} from "lucide-react";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="badge" style={{ marginLeft: "auto" }}>{count > 99 ? "99+" : count}</span>;
}

function MenuLink({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <NavLink to={to} className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`} end={to === "/"}>
      {icon}<span>{label}</span>{badge !== undefined && <Badge count={badge} />}
    </NavLink>
  );
}

export default function Sidebar({ me }: { me: Me | null }) {
  const [badges, setBadges] = useState<BadgeCounts>({ lab: 0, lab_dispatch: 0, bodega: 0, qa: 0 });
  const readOnly = isReadOnlyRole(me);

  useEffect(() => {
    if (!me) return;
    let active = true;
    const load = async () => {
      try {
        const counts = await getBadgeCounts();
        if (active) setBadges(counts);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };
    void load();
    const timer = window.setInterval(load, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [me]);

  const dashboardRoute = me?.rol === ROLES.TECNICO_LABORATORIO
    ? "/lab/dashboard"
    : me?.rol === ROLES.LOGISTICA
      ? "/bodega/dashboard"
      : me?.rol === ROLES.QA
        ? "/qa"
        : me?.rol === ROLES.TECNICO_TERRENO
          ? "/operacion/ingreso"
          : "/";

  return (
    <aside className="sidebar">
      <div className="sb-brand"><div className="sb-logo"><Cpu size={20} color="white" /></div><span>PMP Suite</span></div>
      <div className="sb-nav">
        {can(me, PERMISSIONS.DASHBOARD_VIEW) && (
          <div className="sb-section">
            <div className="sb-section-title">GENERAL</div>
            <MenuLink to={dashboardRoute} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            {can(me, PERMISSIONS.OS_VIEW) && <MenuLink to="/operacion/os" icon={<FileBarChart size={18} />} label="Órdenes de servicio" />}
            {can(me, PERMISSIONS.OS_CREATE) && <MenuLink to="/operacion/ingreso" icon={<PlusSquare size={18} />} label="Ingreso de OS" />}
            {can(me, PERMISSIONS.EQUIPOS_VIEW) && <MenuLink to="/equipos-operativos" icon={<Cpu size={18} />} label="Equipos en operación" />}
            {can(me, PERMISSIONS.TRACE_VIEW) && <MenuLink to="/trazabilidad" icon={<Search size={18} />} label="Trazabilidad" />}
          </div>
        )}

        {(can(me, PERMISSIONS.USERS_VIEW) || can(me, PERMISSIONS.DISPATCH_WRITE)) && (
          <div className="sb-section">
            <div className="sb-section-title">ADMINISTRACIÓN</div>
            {can(me, PERMISSIONS.USERS_VIEW) && <MenuLink to="/admin/users" icon={<ShieldCheck size={18} />} label="Usuarios" />}
            {can(me, PERMISSIONS.DISPATCH_WRITE) && <MenuLink to="/admin/despacho" icon={<Package size={18} />} label="Control de salida" />}
          </div>
        )}

        {can(me, PERMISSIONS.LAB_VIEW) && (
          <div className="sb-section">
            <div className="sb-section-title">LABORATORIO {readOnly && <span className="badge">consulta</span>}</div>
            <MenuLink to="/lab/dashboard" icon={<LayoutDashboard size={18} />} label="Resumen laboratorio" badge={badges.lab} />
            {can(me, PERMISSIONS.LAB_ASSIGN) && <MenuLink to="/lab/asignacion" icon={<Users size={18} />} label="Asignar carga" />}
            <MenuLink to="/lab/validadores" icon={<Cpu size={18} />} label="Validadores" />
            <MenuLink to="/lab/consolas" icon={<Monitor size={18} />} label="Consolas" />
            {can(me, PERMISSIONS.REPORTS_VIEW) && <MenuLink to="/lab/reportes" icon={<FileBarChart size={18} />} label="Reportes" />}
            {can(me, PERMISSIONS.LAB_DISPATCH) && <MenuLink to="/lab/despacho-qa" icon={<Package size={18} />} label="Despacho laboratorio" badge={badges.lab_dispatch} />}
          </div>
        )}

        {can(me, PERMISSIONS.QA_VIEW) && (
          <div className="sb-section">
            <div className="sb-section-title">CALIDAD {readOnly && <span className="badge">consulta</span>}</div>
            <MenuLink to="/qa" icon={<CheckCircle size={18} />} label="Control QA" badge={badges.qa} />
          </div>
        )}

        {can(me, PERMISSIONS.BODEGA_VIEW) && (
          <div className="sb-section">
            <div className="sb-section-title">LOGÍSTICA {readOnly && <span className="badge">consulta</span>}</div>
            <MenuLink to="/bodega/dashboard" icon={<LayoutDashboard size={18} />} label="Resumen bodega" />
            <MenuLink to="/bodega" icon={<Package size={18} />} label={readOnly ? "Bodega y stock" : "Operaciones"} badge={badges.bodega} />
            <MenuLink to="/bodega/modulos" icon={<Cpu size={18} />} label="Módulos" />
            <MenuLink to="/bodega/repuestos" icon={<Wrench size={18} />} label="Repuestos y stock" />
          </div>
        )}

        {can(me, PERMISSIONS.AI_VIEW) && (
          <div className="sb-section">
            <div className="sb-section-title">INTELIGENCIA ARTIFICIAL</div>
            <MenuLink to="/ia/predicciones" icon={<Brain size={18} />} label="Predicción de fallas" />
          </div>
        )}

        {can(me, PERMISSIONS.SETTINGS_VIEW) && (
          <div className="sb-section">
            <div className="sb-section-title">CUENTA</div>
            <MenuLink to="/settings" icon={<Settings size={18} />} label="Mi contraseña" />
          </div>
        )}
      </div>
    </aside>
  );
}
