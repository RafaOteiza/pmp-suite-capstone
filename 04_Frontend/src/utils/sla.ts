// Define el límite de horas (ej: 72 horas = 3 días)
export const SLA_HOURS_LIMIT = 72; 

export const calculateSLA = (fechaIngreso: string) => {
  if (!fechaIngreso) return { horas: 0, vencido: false, critico: false, texto: 'Sin fecha' };

  const inicio = new Date(fechaIngreso).getTime();
  const ahora = new Date().getTime();
  const limite = inicio + (SLA_HOURS_LIMIT * 60 * 60 * 1000);
  
  const restanteMs = limite - ahora;
  // Convertimos milisegundos a horas
  const horasRestantes = Math.floor(restanteMs / (1000 * 60 * 60));
  
  return {
    horas: horasRestantes,
    vencido: horasRestantes < 0,
    // Es crítico si falta menos de 24h y no está vencido aún
    critico: horasRestantes >= 0 && horasRestantes < 24, 
    texto: horasRestantes < 0 
        ? `Vencido hace ${Math.abs(horasRestantes)}h` 
        : `${horasRestantes}h restantes`
  };
};