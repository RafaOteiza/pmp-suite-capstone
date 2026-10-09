import type {AIRiskItem} from '../api/ai';
// The model returns OS observations. This is a presentation aggregation, not a new prediction.
export function uniqueAssetRisks(observations:AIRiskItem[]):AIRiskItem[]{
 const assets=new Map<string,AIRiskItem>();
 for(const item of observations){
  const key=JSON.stringify([item.tipo_equipo,item.serie_equipo]);
  const previous=assets.get(key);
  if(!previous||item.riesgo_score>previous.riesgo_score)assets.set(key,item);
 }
 return [...assets.values()].sort((a,b)=>b.riesgo_score-a.riesgo_score||a.tipo_equipo.localeCompare(b.tipo_equipo)||a.serie_equipo.localeCompare(b.serie_equipo));
}
