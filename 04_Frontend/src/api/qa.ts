import { api } from "./http";

export interface QaTicket {
  codigo_os: string;
  tipo_equipo: string;
  fecha: string;
  falla: string;
  bus_ppu: string;
  serie: string;
  tecnico_reparador?: string;
}

export const getQaQueue = async () => {
  const { data } = await api.get<QaTicket[]>("/api/qa/queue");
  return data;
};

export const processQa = async (codigo_os: string, accion: 'APROBAR' | 'RECHAZAR', comentario?: string) => {
  const { data } = await api.post("/api/qa/process", { codigo_os, accion, comentario });
  return data;
};