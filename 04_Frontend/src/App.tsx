import { Navigate, Route, Routes, useOutletContext } from "react-router-dom";
import type { Me } from "./api/me";
import { PERMISSIONS, ROLES, type Permission } from "./app/rbac";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import IngresoOSPage from "./pages/IngresoOSPage";
import OrdenesServicioPage from "./pages/OrdenesServicioPage";
import AdminDespachoPage from "./pages/AdminDespachoPage";
import TrazabilidadPage from "./pages/TrazabilidadPage";
import AIPredictionsPage from "./pages/AIPredictionsPage";
import LabDashboardPage from "./pages/LabDashboardPage";
import LabAsignacionPage from "./pages/LabAsignacionPage";
import LabValidadoresPage from "./pages/LabValidadoresPage";
import LabConsolasPage from "./pages/LabConsolasPage";
import LabReportesPage from "./pages/LabReportesPage";
import LabDespachoQaPage from "./pages/LabDespachoQaPage";
import QaPage from "./pages/QaPage";
import BodegaPage from "./pages/BodegaPage";
import BodegaModulosPage from "./pages/BodegaModulosPage";
import BodegaRepuestosPage from "./pages/BodegaRepuestosPage";
import BodegaDashboardPage from "./pages/BodegaDashboardPage";
import EquiposOperativosPage from "./pages/EquiposOperativosPage";
import SettingsPage from "./pages/SettingsPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import NotFoundPage from "./pages/NotFoundPage";

function Guarded({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  return <ProtectedRoute permission={permission}>{children}</ProtectedRoute>;
}

function RootRedirector() {
  const me = useOutletContext<Me | null>();
  if (me?.rol === ROLES.TECNICO_LABORATORIO) return <Navigate to="/lab/dashboard" replace />;
  if (me?.rol === ROLES.TECNICO_TERRENO) return <Navigate to="/operacion/ingreso" replace />;
  if (me?.rol === ROLES.QA) return <Navigate to="/qa" replace />;
  if (me?.rol === ROLES.LOGISTICA) return <Navigate to="/bodega/dashboard" replace />;
  return <DashboardPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Guarded permission={PERMISSIONS.DASHBOARD_VIEW}><RootRedirector /></Guarded>} />

        <Route path="/admin/users" element={<Guarded permission={PERMISSIONS.USERS_VIEW}><AdminUsersPage /></Guarded>} />
        <Route path="/admin/despacho" element={<Guarded permission={PERMISSIONS.DISPATCH_VIEW}><AdminDespachoPage /></Guarded>} />

        <Route path="/operacion/os" element={<Guarded permission={PERMISSIONS.OS_VIEW}><OrdenesServicioPage /></Guarded>} />
        <Route path="/operacion/ingreso" element={<Guarded permission={PERMISSIONS.OS_CREATE}><IngresoOSPage /></Guarded>} />

        <Route path="/lab/dashboard" element={<Guarded permission={PERMISSIONS.LAB_VIEW}><LabDashboardPage /></Guarded>} />
        <Route path="/lab/asignacion" element={<Guarded permission={PERMISSIONS.LAB_ASSIGN}><LabAsignacionPage /></Guarded>} />
        <Route path="/lab/validadores" element={<Guarded permission={PERMISSIONS.LAB_VIEW}><LabValidadoresPage /></Guarded>} />
        <Route path="/lab/consolas" element={<Guarded permission={PERMISSIONS.LAB_VIEW}><LabConsolasPage /></Guarded>} />
        <Route path="/lab/reportes" element={<Guarded permission={PERMISSIONS.REPORTS_VIEW}><LabReportesPage /></Guarded>} />
        <Route path="/lab/despacho-qa" element={<Guarded permission={PERMISSIONS.LAB_DISPATCH}><LabDespachoQaPage /></Guarded>} />

        <Route path="/qa" element={<Guarded permission={PERMISSIONS.QA_VIEW}><QaPage /></Guarded>} />
        <Route path="/bodega" element={<Guarded permission={PERMISSIONS.BODEGA_VIEW}><BodegaPage /></Guarded>} />
        <Route path="/bodega/dashboard" element={<Guarded permission={PERMISSIONS.BODEGA_VIEW}><BodegaDashboardPage /></Guarded>} />
        <Route path="/bodega/modulos" element={<Guarded permission={PERMISSIONS.BODEGA_VIEW}><BodegaModulosPage /></Guarded>} />
        <Route path="/bodega/repuestos" element={<Guarded permission={PERMISSIONS.BODEGA_VIEW}><BodegaRepuestosPage /></Guarded>} />

        <Route path="/equipos-operativos" element={<Guarded permission={PERMISSIONS.EQUIPOS_VIEW}><EquiposOperativosPage /></Guarded>} />
        <Route path="/trazabilidad" element={<Guarded permission={PERMISSIONS.TRACE_VIEW}><TrazabilidadPage /></Guarded>} />
        <Route path="/ia/predicciones" element={<Guarded permission={PERMISSIONS.AI_VIEW}><AIPredictionsPage /></Guarded>} />
        <Route path="/settings" element={<Guarded permission={PERMISSIONS.SETTINGS_VIEW}><SettingsPage /></Guarded>} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
