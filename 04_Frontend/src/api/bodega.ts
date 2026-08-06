import { api } from "./http";

export interface BodegaTicket {
  codigo_os: string;
  fecha: string;
  falla: string;
  estado_id: number;
  estado_nombre: string;
  bus_ppu: string;
  serie: string;
  tipo_equipo: string;
  es_aprobado_qa?: boolean | null;
  fue_laboratorio: boolean;          // Si ya pasó por reparación en Lab
  origen_transito: 'terreno' | 'laboratorio' | 'qa_rechazado'; // Origen del equipo en tránsito
}

export interface StockData {
  listos: BodegaTicket[];
  inventario: {
    validadores: number;
    consolas: number;
    total: number;
  };
}

export interface Repuesto {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  stock_critico: number;
  diferencia: number;
}

export interface SolicitudRepuesto {
  id: number;
  codigo_os: string;
  estado: string;
  fecha_solicitud: string;
}

export interface TecnicoTerreno {
  id: string;
  nombre: string;
  apellido: string;
}

export interface BodegaDashboardData {
  alertasStock: number;
  distribucionEstados: { name: string, value: number, estado_id: number }[];
  equiposEnRuta: number;
}

export async function getBodegaQueue(): Promise<BodegaTicket[]> {
  const { data } = await api.get("/api/bodega/queue");
  return data;
}

export async function getBodegaStock(): Promise<StockData> {
  const { data } = await api.get("/api/bodega/stock");
  return data;
}

export async function receiveInBodega(codigo_os: string): Promise<void> {
  await api.put("/api/bodega/receive", { codigo_os });
}

export async function dispatchToLab(codigo_os: string): Promise<void> {
  await api.put("/api/bodega/dispatch-lab", { codigo_os });
}

export async function dispatchToQa(codigo_os: string): Promise<void> {
  await api.put("/api/bodega/dispatch-qa", { codigo_os });
}

export async function getRepuestos(): Promise<{repuestos: Repuesto[], solicitudes: SolicitudRepuesto[]}> {
  const { data } = await api.get("/api/bodega/repuestos");
  return data;
}

export async function updateRepuestoStock(id: number, nuevo_stock: number): Promise<void> {
  await api.put(`/api/bodega/repuestos/${id}/stock`, { nuevo_stock });
}

export async function entregarRepuesto(solicitudId: number): Promise<void> {
  await api.put(`/api/bodega/solicitudes/${solicitudId}/entregar`);
}

export async function getTecnicosTerreno(): Promise<TecnicoTerreno[]> {
  const { data } = await api.get("/api/bodega/tecnicos");
  return data;
}

export async function asignarEquipo(codigo_os: string, tecnico_terreno_id: string, bus_ppu: string): Promise<void> {
  await api.put("/api/bodega/asignar", { codigo_os, tecnico_terreno_id, bus_ppu });
}

export async function getBodegaDashboard(): Promise<BodegaDashboardData> {
  const { data } = await api.get("/api/bodega/dashboard");
  return data;
}
