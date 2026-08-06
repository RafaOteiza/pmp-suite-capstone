import { api } from "./http";

export interface CreateOSPayload {
  tipo: "CONSOLA" | "VALIDADOR";
  es_pod: boolean;
  foto_dano_url?: string;
  falla: string;
  bus_ppu: string;
  serie_equipo: string;
  modelo?: string;
  marca?: string;
}

export interface OrdenServicio {
  codigo_os: string;
  fecha: string;
  actualizado_en?: string;
  tipo_equipo: "CONSOLA" | "VALIDADOR";
  falla: string;
  bus_ppu: string;
  ticket_aranda?: string;
  estado_id: number;
  estado_nombre: string;
  ubicacion_id?: number;
  ubicacion_nombre?: string;
  serie: string;
  tecnico_terreno?: string;
  tecnico_laboratorio?: string;
}

export interface OsListParams {
  q?: string;
  tipo_equipo?: "CONSOLA" | "VALIDADOR" | "";
  estado_id?: number;
  limit?: number;
  offset?: number;
}

export interface OsListResponse {
  items: OrdenServicio[];
  pagination: { total: number; limit: number; offset: number };
}

export const createOS = async (payload: CreateOSPayload) => {
  const { data } = await api.post("/api/os/crear", payload);
  return data;
};

export async function getOs(codigoOS: string): Promise<OrdenServicio> {
  const { data } = await api.get<OrdenServicio>(`/api/os/${encodeURIComponent(codigoOS)}`);
  return data;
}

export async function listOs(params: OsListParams = {}): Promise<OsListResponse> {
  const { data } = await api.get<OsListResponse>("/api/os", {
    params: { limit: 25, offset: 0, ...params }
  });
  return data;
}
