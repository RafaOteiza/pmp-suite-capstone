# PMP Suite — Requerimientos

> **Documento vigente:** 09-10-2026.  
> Esta carpeta contiene la especificación funcional y no funcional alineada con el código actual. Los documentos con versiones anteriores se conservan como referencia histórica y no prevalecen sobre la ERS vigente.

## Fuente de verdad

La prioridad documental es:

1. Código actual de Backend, Web y Mobile.
2. [ERS v5.0 vigente](ERS_PMP_Suite_v5_0.md).
3. Requisitos modulares de esta carpeta.
4. Arquitectura de `02_Arquitectura/`.
5. Evidencias fechadas de `08_Pruebas/`.

La línea académica Capstone se conserva en `Documentacion Capstone/`; sus versiones históricas no deben interpretarse como contrato técnico actual cuando contradicen el sistema implementado.

## Documentos

| Documento | Estado | Alcance |
|---|---|---|
| [ERS_PMP_Suite_v5_0.md](ERS_PMP_Suite_v5_0.md) | **Vigente** | Requisitos transversales y modelo operacional actual |
| [Auth_Users_Requerimientos.md](Auth_Users_Requerimientos.md) | Vigente | Firebase, PostgreSQL, RBAC, usuarios y seguridad personal |
| [Administracion_General_Requerimientos.md](Administracion_General_Requerimientos.md) | Vigente | Administración del sistema y supervisión |
| [Bodega_Logistica_Requerimientos.md](Bodega_Logistica_Requerimientos.md) | Vigente | Custodia de Bodega, inventario, despacho y repuestos |
| [Laboratorio_Requerimientos.md](Laboratorio_Requerimientos.md) | Vigente | Recepción, carga, trabajo técnico y despacho |
| [QA_Requerimientos.md](QA_Requerimientos.md) | Vigente | Flujo autónomo QA |
| [OS_Requerimientos.md](OS_Requerimientos.md) | Vigente | Casos, OS, prefijos y ciclo de vida |
| [IA_Requerimientos.md](IA_Requerimientos.md) | Vigente | Analítica/IA como apoyo de solo lectura |
| [ERS_PMP_Suite_v4_0.md](ERS_PMP_Suite_v4_0.md) | **Histórico** | Línea anterior; no usar para decisiones nuevas |
| Matriz_Requerimientos_PMP_Suite.xlsx | Complementario | Matriz académica; revisar contra ERS vigente |

## Principios no negociables

- **Identidad física:** tipo + serie.
- **Modelo/marca autoritativos:** Validador 72→CVB35, 74/75→CVB45, Mikroelektronika; Consola→N9715/Waysion.
- **Physical First:** una consulta, selección o lectura antigua no mueve custodia.
- **Custodia separada por movimiento:** salida y recepción son confirmaciones distintas.
- **RBAC sin wildcard Admin:** Admin administra y supervisa; no hereda automáticamente permisos operacionales.
- **Gerente:** supervisión de solo lectura.
- **Jefe Laboratorio:** custodia, asignación y supervisión de Laboratorio; no administración global.
- **Técnicos:** solo carga propia/asignada.
- **Bridge:** correlación e historial; no crea OS ni mueve stock.
- **IN:** se crea al confirmar despacho físico a Terreno.
- **Errores vs. vacíos:** un fallo de API no se representa como cero ni como lista vacía.

## Roles oficiales

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

La autorización efectiva se resuelve en backend; la interfaz solo presenta las capacidades permitidas.
