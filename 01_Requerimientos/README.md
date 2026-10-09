# PMP Suite — Requerimientos

**Versión documental:** V2.0  
**Actualización:** 09-10-2026

Esta carpeta contiene una sola línea documental vigente. Las versiones anteriores fueron retiradas del árbol actual; su trazabilidad permanece en Git.

## Fuente de verdad

1. Código vigente de Backend, Web y Mobile.
2. [ERS PMP Suite V2.0](ERS_PMP_Suite_V2.0.md).
3. Requisitos modulares V2.0.
4. Arquitectura V2.0 de `02_Arquitectura/`.
5. Pruebas V2.0 de `08_Pruebas/`.

## Documentos V2.0

| Documento | Alcance |
|---|---|
| [ERS_PMP_Suite_V2.0.md](ERS_PMP_Suite_V2.0.md) | Especificación transversal |
| [Auth_Users_Requerimientos_V2.0.md](Auth_Users_Requerimientos_V2.0.md) | Firebase, PostgreSQL, RBAC y usuarios |
| [Administracion_General_Requerimientos_V2.0.md](Administracion_General_Requerimientos_V2.0.md) | Administración y supervisión |
| [Bodega_Logistica_Requerimientos_V2.0.md](Bodega_Logistica_Requerimientos_V2.0.md) | Bodega, inventario y despachos |
| [Laboratorio_Requerimientos_V2.0.md](Laboratorio_Requerimientos_V2.0.md) | Jefatura y trabajo técnico |
| [QA_Requerimientos_V2.0.md](QA_Requerimientos_V2.0.md) | QA autónomo |
| [OS_Requerimientos_V2.0.md](OS_Requerimientos_V2.0.md) | Casos, OS e instalaciones |
| [IA_Requerimientos_V2.0.md](IA_Requerimientos_V2.0.md) | Analítica de reincidencia |
| `Matriz_Requerimientos_PMP_Suite_V2.0.xlsx` | Matriz complementaria |

## Principios obligatorios

- identidad física = tipo + serie;
- 72 → CVB35; 74/75 → CVB45; Mikroelektronika;
- Consola → N9715 / Waysion;
- Physical First y evidencia independiente por movimiento;
- Admin sin wildcard operacional;
- Gerente de solo lectura;
- Jefe Laboratorio limitado al dominio Laboratorio;
- técnicos limitados a carga propia/asignada;
- Bridge solo correlaciona;
- IN se crea al confirmar el despacho físico a Terreno;
- error de consulta no se presenta como cero ni como vacío.
