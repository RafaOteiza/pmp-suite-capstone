# 01 — SRS Simplificado PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente  
**Actualización:** 09-10-2026  
**Documento maestro relacionado:** `01_Requerimientos/ERS_PMP_Suite_V2.0.md`

## 1. Propósito

Este artefacto resume la especificación de requisitos del proyecto sin reemplazar la ERS exhaustiva. Su función es entregar una vista académica estructurada del problema, actores, reglas, requisitos por dominio, RNF, criterios de aceptación y trazabilidad.

La ERS maestra contiene **20 reglas de negocio transversales, 210 requisitos funcionales y 38 requisitos no funcionales**.

## 2. Problema que origina los requisitos

El ciclo de mantenimiento de validadores y consolas se ejecuta entre Terreno, Bodega/Mersan, Laboratorio, QA y supervisión. En el AS-IS, información del mismo equipo puede quedar distribuida entre guía, tarjetón, correo, planilla de Laboratorio, control PoD, QA y referencias externas.

Los requisitos de PMP Suite responden a cinco necesidades centrales:

1. **Identidad:** saber inequívocamente qué activo se está tratando.
2. **Custodia:** distinguir tránsito, recepción y salida física.
3. **Responsabilidad:** impedir que un rol opere fuera de su dominio.
4. **Trazabilidad:** reconstruir el historial por tipo+serie.
5. **Consistencia:** mantener alineados caso, OS, activo, stock, reparación y QA.

## 3. Alcance del sistema

### 3.1 Incluido

- autenticación Firebase;
- usuario/rol efectivo PostgreSQL;
- administración de usuarios;
- maestros de terminal/PST/bus;
- activos y recepción inicial;
- casos/requerimientos;
- OS MV/MC/PDV/PDC/IN;
- retiros e instalaciones Terreno;
- custodia Bodega;
- Laboratorio;
- repuestos;
- QA;
- inventario;
- Bridge/correlación;
- trazabilidad;
- dashboards;
- Web/Mobile;
- analítica de reincidencia.

### 3.2 Fuera de alcance

- integración automática con Aranda;
- decisión automática de reparación/baja por IA;
- procedimiento técnico no especificado de Instalación Ambiente;
- producción certificada;
- motor dinámico de permisos configurable por usuario final.

## 4. Actores

| Actor | Objetivo | Restricción principal |
|---|---|---|
| Admin | cuentas, roles, seguridad, supervisión | no hereda operación física |
| Gerente | indicadores/trazabilidad | solo lectura |
| Jefe Laboratorio | custodia, carga, SLA y salida Lab | no opera Bodega/QA/Terreno |
| Logística | Bodega, inventario, repuestos y movimientos | no repara ni certifica |
| QA | recepción, Ambiente, pruebas, dictamen y salida | no depende de asignación Admin |
| Técnico Laboratorio | diagnóstico/reparación/pruebas | solo su carga; sin stock |
| Técnico Terreno | falla, retiro, instalación | solo trabajo propio/asignado |

## 5. Reglas de negocio transversales

1. Activo = `tipo_equipo + serie`.
2. Serie 72… = CVB35/Mikroelektronika.
3. Serie 74…/75… = CVB45/Mikroelektronika.
4. Consola = N9715/Waysion.
5. Prefijo de validador desconocido se bloquea.
6. Validar/leer no cambia custodia.
7. Recepción y salida son movimientos independientes.
8. Evidencia no se reutiliza entre propósito/ciclo.
9. Identidad de una OS es inmutable.
10. Bridge no crea OS ni mueve stock.
11. IN se crea al confirmar despacho Bodega→Terreno.
12. Admin no tiene wildcard operacional.
13. Gerente no escribe operación.
14. Técnico solo opera carga propia/asignada.
15. Técnico Lab no administra inventario.
16. QA opera de manera autónoma.
17. Error no se presenta como cero/lista vacía.
18. Datos conocidos relacionados se autocompletan; ambigüedad se pregunta.
19. Rechazo QA crea un nuevo ciclo físico para el reingreso.
20. Eventos históricos críticos son append-only.

## 6. Grupos de requisitos funcionales

| Grupo | Cantidad | Dominio |
|---|---:|---|
| RF-AUT | 8 | autenticación/sesión |
| RF-USR | 11 | usuarios |
| RF-MST | 6 | maestros |
| RF-ACT | 15 | activos/recepción inicial |
| RF-REQ | 18 | casos/requerimientos |
| RF-OS | 10 | nomenclatura/relaciones OS |
| RF-TER | 13 | Terreno |
| RF-BOD | 13 | Bodega |
| RF-LAB | 13 | custodia/supervisión Lab |
| RF-LTW | 21 | trabajo técnico Lab |
| RF-REP | 9 | repuestos |
| RF-QA | 18 | QA |
| RF-INV | 12 | inventario/instalación |
| RF-BRG | 5 | correlación externa |
| RF-TRZ | 6 | trazabilidad |
| RF-DASH | 10 | dashboards/reportes |
| RF-IA | 7 | inteligencia operacional |
| RF-UX | 8 | experiencia Web |
| RF-MOB | 7 | Mobile |

Total RF: **210**.

## 7. Requisitos funcionales destacados por dominio

### 7.1 Auth y usuarios

- Firebase autentica; PostgreSQL define usuario activo y rol.
- Conflicto UID/correo bloquea acceso.
- Claims/body/query no otorgan permisos.
- Admin puede crear/editar/activar/desactivar cuentas autorizadas.
- Último Admin activo está protegido.
- Autoedición de rol/estado privilegiado está bloqueada.
- Contraseña no se persiste en PostgreSQL.
- Usuario puede cambiar su propia contraseña.

### 7.2 Activos

- Alta registra maestro sin crear OS.
- Modelo/marca se derivan de identidad autoritativa.
- Recepción inicial requiere evidencia física.
- Recepción inicial genera `RECEPCION_INICIAL` y `HABILITADO_INSTALACION`.
- Stock inicial no tiene OS hasta el despacho real.
- Un activo duplicado o con prefijo inválido se rechaza.

### 7.3 Casos/requerimientos

- Requerimiento trabaja sobre activo registrado.
- Caso, OS, activo y referencia externa son objetos distintos.
- Origen puede ser INTERNO o ARANDA.
- Contexto bus/terminal/PST se revalida.
- No se permite intervención incompatible simultánea del mismo activo.
- Creación de caso+OS+correlación es transaccional.

### 7.4 OS

- MV: mantenimiento Validador.
- MC: mantenimiento Consola.
- PDV/PDC: PoD.
- IN: instalación.
- Código se genera Backend/BD.
- IN usa secuencia independiente.
- OS reparada del retirado no representa el reemplazo.
- Relaciones de origen/stock/caso son inmutables.

### 7.5 Terreno

- Técnico ve solo sus OS.
- Logística asigna retiro.
- Técnico valida identidad y puede registrar discrepancia.
- Retiro confirmado deja el activo en tránsito.
- Mobile puede registrar evidencia PoD según reglas.
- Completar instalación deja el activo operativo.
- Historial entregado a Terreno es una proyección técnica restringida.

### 7.6 Bodega

- Cola diferencia recepción y despacho.
- Tránsito no equivale a custodia Bodega.
- Cada salida requiere nueva evidencia.
- Bodega controla despachos a Lab, QA y Terreno.
- Inventario distingue parque, stock físico y elegibilidad.
- Badges deben compartir definición con las colas.
- Repuestos y solicitudes son responsabilidad logística.

### 7.7 Laboratorio — Jefatura

- Bandeja: En camino / Recibidos / Incidencias / Historial.
- Recepción física inicia SLA.
- No se asigna un equipo En camino.
- Jefe Lab asigna/reasigna.
- Asignación no cambia custodia.
- Jefe Lab supervisa carga/SLA.
- Cierre técnico no confirma salida.
- Jefe Lab valida y confirma salida a Bodega.

### 7.8 Laboratorio — Técnico

- Solo carga propia.
- Trabajo requiere recepción vigente.
- Diagnóstico soporta confirmada/diferente/NFF/PoD/otro.
- Intervenciones y observaciones se registran.
- Métodos de prueba autorizados: **Manual / Test MK**.
- Cierre exige pruebas aprobadas.
- Solicitud de repuesto es descriptiva y requiere contexto PoD según regla.
- Técnico no selecciona ID/cantidad de inventario.
- No puede cerrar si queda solicitud de Bodega pendiente.
- Antecedentes de rechazo QA deben estar visibles en reingreso.

### 7.9 Repuestos

- Logística consulta stock.
- Se alerta stock crítico.
- Entrega valida categoría/cantidad/stock.
- Stock disminuye en una transacción de entrega.
- Reintento idéntico es idempotente.
- Sobrescritura directa de stock está bloqueada sin política de ajuste.

### 7.10 QA

- Bodega confirma salida hacia QA.
- QA confirma recepción física.
- QA toma su trabajo sin asignación administrativa.
- Etapas: Recepción → Ambiente → Pruebas → Dictamen → Salida.
- Dictamen no cambia custodia.
- Rechazo exige motivo.
- Salida usa evidencia independiente.
- Bodega debe confirmar recepción posterior.
- Rechazo retorna a corrección en nuevo ciclo.
- Endpoints legacy de asignación/proceso están retirados.

### 7.11 Inventario e instalación

- Parque global ≠ stock físico.
- Disponible ≠ simplemente estado_id=7.
- Origen stock: evento inicial o OS reparada.
- Origen consumido una vez.
- Despacho valida contexto, identidad y elegibilidad.
- Confirmación crea IN y SALIDA_BODEGA_TERRENO atómicamente.
- Seleccionar técnico/PPU/serie no crea IN.

### 7.12 Bridge/trazabilidad

- Bridge busca referencia/OS/serie.
- Logística crea correlación.
- Correlación debe coincidir con el activo de la OS.
- Correlación es inmutable.
- Bridge no funciona como motor operacional.
- Historial por activo combina OS, eventos, escaneos, reparación y referencias.

### 7.13 Dashboards

- Parque se cuenta por activo único.
- OS activas se separan de parque.
- Custodia/tránsito no se duplican.
- Dashboard ejecutivo, Bodega, Lab y QA respetan RBAC.
- Cero real, sin medición y error se distinguen.

### 7.14 Inteligencia operacional

- API ejecuta Python bajo demanda.
- Consulta PostgreSQL en lectura.
- Score no ejecuta acciones.
- UI debe identificar método heurístico.
- No se declaran precisión/recall sin evaluación reproducible.

### 7.15 Web/Mobile

- navegación por capacidades;
- rutas directas protegidas;
- temas claro/oscuro; Mobile incluye automático;
- feedback inline;
- procesos operacionales fuera de modales;
- responsive;
- Mobile login/jornada/falla/retiro/instalación/historial/cuenta.

## 8. Requisitos no funcionales

| Grupo | Cantidad | Objetivo |
|---|---:|---|
| RNF-SEC | 8 | seguridad |
| RNF-DAT | 7 | integridad |
| RNF-PER | 4 | rendimiento |
| RNF-REL | 4 | confiabilidad/errores |
| RNF-UX | 6 | usabilidad |
| RNF-MAN | 5 | mantenibilidad |
| RNF-COM | 4 | compatibilidad/entorno |

Total RNF: **38**.

### 8.1 Seguridad

- autenticación Firebase;
- rol PostgreSQL;
- denegación por defecto;
- secretos fuera de Git;
- logs sin credenciales;
- payload sensible procesado después de Auth/RBAC;
- último Admin protegido.

### 8.2 Integridad

- transacciones;
- identidad inmutable;
- historial append-only;
- evidencia asociada a estación/propósito/ciclo;
- idempotencia;
- conflicto de reintento incompatible;
- constraints/FKs.

### 8.3 Rendimiento

- paginación/límites;
- búsquedas acotadas;
- índices para serie/OS/eventos/referencias;
- pruebas de carga aisladas.

### 8.4 Confiabilidad

- errores HTTP de dominio coherentes;
- rollback ante fallos;
- no ocultar error como cero;
- recuperación controlada/reintento seguro.

### 8.5 UX

- estado semántico consistente;
- foco visible;
- responsive;
- objetivos táctiles Mobile;
- claro/oscuro;
- progresive disclosure/feedback contextual.

### 8.6 Mantenibilidad

- servicios por dominio;
- reglas compartidas;
- documentación V2.0;
- pruebas de regresión;
- migraciones aditivas.

## 9. Criterios de aceptación críticos

| Criterio | Esperado |
|---|---|
| identidad incompatible | bloqueada |
| prefijo desconocido | no se infiere |
| evidencia de otra estación/ciclo | bloqueada |
| Admin intenta custodia Lab | 403 |
| Gerente intenta escritura | 403 |
| Técnico intenta OS ajena | 403 |
| asignación QA legacy | 410 |
| Bridge operacional antiguo | 410 |
| cierre Lab sin pruebas | bloqueado |
| repuesto sin stock | bloqueado |
| stock inicial sin despacho | no genera IN |
| doble consumo origen | bloqueado |
| dictamen QA | no confirma salida |
| error de API | visible, no cero |
| tablero parque | activos únicos |

## 10. Priorización

### Crítica

Identidad, Auth/RBAC, custodia, movimientos, OS, Lab, QA, inventario, repuestos, integridad DB.

### Alta

Trazabilidad, dashboards, UX, Mobile, maestros/autocompletado.

### Media

Analítica y mejoras de reportabilidad no esenciales al flujo transaccional.

## 11. Verificación

Resultados vigentes documentados:

- Backend 118/118.
- Web 176/177.
- Mobile 210/210 con mocks.
- RBAC aislado 99 requests.
- E2E Lab aprobado.
- E2E operacional integral aprobado.
- build Web aprobado.
- responsive/RBAC 150 renders.

Pendientes: fixture Web, dispositivo físico, recorrido manual final y repetición de rendimiento/seguridad.

## 12. Trazabilidad

La matriz exhaustiva se encuentra en:

`08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`

y relaciona cada RN/RF/RNF con:

```text
requisito
→ actor/prioridad
→ componente/servicio
→ prueba/evidencia
→ estado
```

## 13. Documentos relacionados

- problemática: `Documentacion Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md`;
- arquitectura: `02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md`;
- datos: `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`;
- API: `02_Arquitectura/CATALOGO_API_V2.0.md`;
- BPMN: `Documentacion Capstone/BPMN/`.
