import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { useSession } from "../app/SessionContext";

export default function ForbiddenPage() {
  const { status } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return (
    <main className="panel" role="alert" style={{ maxWidth: 620, margin: "64px auto", textAlign: "center" }}>
      <ShieldX size={48} style={{ margin: "0 auto 16px", color: "#EF4444" }} aria-hidden="true" />
      <h1 className="title">403 · Acceso restringido</h1>
      <p className="muted">Tu rol no posee la capacidad requerida para acceder a esta ruta.</p>
      <p className="small muted">Ruta solicitada: {location.state?.from ?? "no autorizada"}</p>
      <button className="btn" onClick={() => navigate("/", { replace: true })}>Volver al inicio</button>
    </main>
  );
}
