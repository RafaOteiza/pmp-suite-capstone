import { Eye } from "lucide-react";
import type { Me } from "../api/me";
import { isReadOnlyRole } from "../app/rbac";

export default function ReadOnlyNotice({ me }: { me: Me | null }) {
  if (!isReadOnlyRole(me)) return null;

  return (
    <div
      role="status"
      aria-label="Modo solo lectura"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        marginBottom: 16,
        borderRadius: 8,
        border: "1px solid rgba(245,158,11,0.35)",
        background: "rgba(245,158,11,0.1)",
        color: "#F59E0B",
        fontSize: "0.85rem",
        fontWeight: 700
      }}
    >
      <Eye size={16} aria-hidden="true" />
      Modo solo lectura
    </div>
  );
}
