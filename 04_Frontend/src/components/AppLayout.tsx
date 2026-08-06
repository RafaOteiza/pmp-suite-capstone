import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useSession } from "../app/SessionContext";
import { READ_ONLY_DENIED_EVENT, READ_ONLY_ROLE_MESSAGE } from "../api/errors";

export default function AppLayout() {
  const { me } = useSession();
  const [readOnlyError, setReadOnlyError] = useState<string | null>(null);

  useEffect(() => {
    const onReadOnlyDenied = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      setReadOnlyError(customEvent.detail?.message || READ_ONLY_ROLE_MESSAGE);
    };
    window.addEventListener(READ_ONLY_DENIED_EVENT, onReadOnlyDenied);
    return () => window.removeEventListener(READ_ONLY_DENIED_EVENT, onReadOnlyDenied);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar me={me} />
      <div className="app-main">
        <TopBar me={me} />
        <div className="app-content">
          {readOnlyError && (
            <div
              role="alert"
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.1)",
                color: "#FCA5A5",
                display: "flex",
                justifyContent: "space-between",
                gap: 16
              }}
            >
              <span>{readOnlyError}</span>
              <button className="btn ghost" onClick={() => setReadOnlyError(null)}>Cerrar</button>
            </div>
          )}
          <Outlet context={me} />
        </div>
      </div>
    </div>
  );
}
