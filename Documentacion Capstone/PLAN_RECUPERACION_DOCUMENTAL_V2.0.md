# Plan de recuperación documental PMP Suite V2.0

**Fecha:** 09-10-2026  
**Estado:** revisión técnica requerida antes de declarar documentación completa.

## Hallazgo
La consolidación anterior eliminó información histórica útil y dejó documentos resumidos. El ERD actual no es un diccionario de datos completo; tampoco existe un par BPMN AS-IS / TO-BE verificable en el árbol vigente.

## Criterios de reconstrucción
1. Reconstruir desde el código actual, migraciones y requisitos modulares, no desde números de versión anteriores.
2. Distinguir explícitamente hecho implementado, comportamiento observado, requisito y pendiente.
3. Generar inventario de tablas, columnas, PK, FK, índices, restricciones y secuencias desde PostgreSQL real o DDL completo verificable.
4. Documentar los procesos reales de Laboratorio: recepción desde Mersan, guía/tarjetón/series por correo, registros separados, diagnóstico, reparación, QA, despacho y PoD; diferenciar excepciones de proceso.
5. Modelar BPMN AS-IS y TO-BE con pools, lanes, eventos, gateways, mensajes, excepciones y correspondencia con los módulos.
6. Mantener evidencia histórica y scripts necesarios para reproducibilidad hasta validar sus reemplazos; Git permite recuperar archivos eliminados, pero no debe confundirse con documentación académica entregable.
7. No cambiar Fase 1, código operacional, base habitual ni identidades.

## Entregables de detalle necesarios
- Problemática y diagnóstico del proceso.
- Catálogo completo de requisitos RF/RNF con prioridad, origen, módulo, estado y pruebas.
- Arquitectura C4, componentes, contratos API, despliegue y secuencias.
- Modelo físico de datos y diccionario de datos.
- BPMN AS-IS y TO-BE validables.
- Matriz de trazabilidad requisito → implementación → caso de prueba → evidencia.
- Manual técnico y manuales por rol.
- Informe de pruebas con resultados fechados y limitaciones.

## Advertencia
El árbol V2.0 actual no certifica por sí solo que estos entregables estén completos. No utilizar un diagrama conceptual como sustituto del esquema físico.
