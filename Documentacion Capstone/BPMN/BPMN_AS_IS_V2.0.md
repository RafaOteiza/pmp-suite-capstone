# BPMN AS-IS — Proceso actual previo a PMP Suite

**Versión:** V2.0  
**Ámbito principal:** Laboratorio de Garantías y coordinación con áreas relacionadas.

## 1. Objetivo

Representar el proceso previo a la centralización, incluyendo canales paralelos, registros manuales y puntos de conciliación.

## 2. Pools/Lanes

**Pool: Proceso de mantenimiento actual**

- Bodega/Mersan
- Laboratorio/Jefatura
- Técnico Laboratorio
- QA
- Analistas/Cliente
- Gestión PoD

## 3. Flujo AS-IS

```mermaid
flowchart TB
 subgraph B["Bodega / Mersan"]
   B1[Retirar / agrupar equipo]
   B2[Preparar guía o informar urgencia]
   B3[Enviar equipo]
   B4[Recibir equipo reparado / QA]
 end
 subgraph J["Jefatura Laboratorio"]
   J1[Recibir equipo]
   J2{¿Guía / antecedentes disponibles?}
   J3[Conciliar serie, tarjetón, correo y planillas]
   J4[Registrar ingreso en control interno]
   J5[Asignar trabajo]
   J6[Preparar despacho por lote]
 end
 subgraph T["Técnico Laboratorio"]
   T1[Diagnosticar]
   T2{Resultado}
   T3[Reparar]
   T4[Solicitar / esperar repuesto]
   T5[Registrar PoD]
   T6[Ejecutar pruebas]
   T7[Informar solución]
 end
 subgraph Q["QA"]
   Q1[Recibir información/equipo]
   Q2[Ejecutar control]
   Q3{¿Aprobado?}
   Q4[Informar rechazo]
   Q5[Informar aprobación]
 end
 subgraph A["Analistas / Cliente"]
   A1[Enviar series / antecedentes por correo]
   A2[Consultar estado]
   A3[Conciliar reportes]
 end
 subgraph P["Gestión PoD"]
   P1[Informe técnico]
   P2[Planilla / seguimiento separado]
 end

 B1-->B2-->B3-->J1
 A1-.correo.->J2
 J1-->J2
 J2--Sí-->J3
 J2--No / urgencia-->J3
 J3-->J4-->J5-->T1
 T1-->T2
 T2--Reparable-->T3-->T6
 T2--Repuesto-->T4-->T3
 T2--PoD-->T5-->P1-->P2
 T5-->T6
 T2--NFF-->T6
 T6-->T7-->J6
 J6-->Q1-->Q2-->Q3
 Q3--No-->Q4-->J3
 Q3--Sí-->Q5-->B4
 A2-.consulta manual.->J4
 J4-.planillas/correos.->A3
```

## 4. Gateways y excepciones

### G1 — Documentación de ingreso

Puede existir guía, información parcial o ingreso urgente. Esto obliga a conciliar antecedentes manualmente.

### G2 — Diagnóstico

Resultados posibles:

- falla confirmada;
- falla diferente;
- NFF;
- PoD;
- necesidad de repuesto;
- otro diagnóstico técnico.

### G3 — QA

QA puede aprobar o rechazar. Un rechazo provoca reingreso al circuito técnico y nueva conciliación.

## 5. Puntos de dolor AS-IS

| Punto | Problema |
|---|---|
| Recepción | guía/tarjetón/correo pueden llegar desfasados |
| Identidad | la serie puede aparecer en registros distintos |
| Registro | múltiples planillas sin sincronización |
| Custodia | difícil distinguir tránsito de recepción real |
| Asignación | seguimiento manual de carga |
| Reparación | antecedentes técnicos distribuidos |
| Repuestos | coordinación separada |
| PoD | informe/planilla paralela |
| QA | resultados en otro registro |
| Despacho | lotes y fechas no necesariamente alineados a una única fuente |
| Consulta | reconstrucción manual ante preguntas de estado |

## 6. Riesgos

- error de identidad;
- pérdida de trazabilidad;
- doble digitación;
- estados inconsistentes;
- demora en conciliación;
- decisiones con información incompleta;
- evidencia física no asociada al movimiento exacto.
