
import { api } from "./http";

export interface AIRiskItem {
    serie_equipo: string;
    tipo_equipo: string;
    falla: string;
    fallas_previas: number;
    riesgo_score: number;
}

export const getAIRiskReport = async (): Promise<AIRiskItem[]> => {
    const response = await api.get("/api/ai/predictive-report");
    return response.data;
};
