import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Me } from "../api/me";
import { SESSION_INVALIDATED_EVENT } from "../api/errors";
import { clearToken, getToken } from "./token";
import {
  getCachedMe,
  clearCachedMe,
  getInitialSessionState,
  loadMeOrNull,
  type SessionStatus
} from "./session";

type SessionContextValue = {
  status: SessionStatus;
  me: Me | null;
  previewMe: Me | null;
  refreshSession: () => Promise<Me | null>;
  endSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const initial = getInitialSessionState(getToken(), getCachedMe());
  const [status, setStatus] = useState<SessionStatus>(initial.status);
  const [me, setMe] = useState<Me | null>(initial.me);
  const [previewMe, setPreviewMe] = useState<Me | null>(initial.previewMe);

  const refreshSession = useCallback(async () => {
    if (!getToken()) {
      setMe(null);
      setPreviewMe(null);
      setStatus("unauthenticated");
      return null;
    }

    setMe(null);
    setPreviewMe(getCachedMe());
    setStatus("loading");
    const confirmed = await loadMeOrNull();
    setMe(confirmed);
    setPreviewMe(confirmed);
    setStatus(confirmed ? "authenticated" : "unauthenticated");
    return confirmed;
  }, []);

  const endSession = useCallback(() => {
    clearToken();
    clearCachedMe();
    setMe(null);
    setPreviewMe(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    window.addEventListener(SESSION_INVALIDATED_EVENT, endSession);
    return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, endSession);
  }, [endSession]);

  const value = useMemo(
    () => ({ status, me, previewMe, refreshSession, endSession }),
    [status, me, previewMe, refreshSession, endSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe utilizarse dentro de SessionProvider");
  return context;
}
