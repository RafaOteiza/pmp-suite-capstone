# Documentación Capstone — PMP Suite

**Estado documental:** actualizado al 09-10-2026.

Esta carpeta reúne la documentación académica del proyecto. La **Fase 1 se conserva sin modificaciones**, por instrucción del equipo. La documentación posterior se organiza entre fuentes oficiales, entregables académicos, artefactos de metodología Cascada y evidencia técnica.

## Estructura

- **Fase 1/** — entrega histórica aprobada; no modificar.
- **Fase 2/** — plantillas oficiales y entregables de avance/final.
- **Artefactos Metodologia Cascada/** — documentos metodológicos vigentes y archivo histórico.
- **Evidencias/** — índice académico de evidencias; el detalle técnico reside principalmente en `08_Pruebas/`.
- **Referencias Oficiales/** — instructivos y documentos institucionales sin modificaciones.
- **BITACORA_CIERRE_CAPSTONE.md** — estado de cierre, decisiones, brechas y próximos pasos.

## Fuentes de verdad

Para el **estado funcional actual** del sistema prevalecen, en este orden:

1. código de `03_Backend/`, `04_Frontend/`, `07_Mobile/` y esquema/migraciones;
2. `01_Requerimientos/ERS_PMP_Suite_v5_0.md`;
3. `02_Arquitectura/`;
4. evidencias fechadas de `08_Pruebas/`;
5. artefactos Cascada vigentes de esta carpeta.

Las versiones históricas se conservan para trazabilidad académica, pero no deben utilizarse para describir permisos, custodia o flujos actuales si contradicen la documentación vigente.

## Estado del proyecto

PMP Suite dispone de un núcleo funcional integrado Web/API/PostgreSQL/Firebase/Mobile, con flujos de Terreno, Bodega, Laboratorio y QA, trazabilidad por activo, RBAC, administración de usuarios y analítica de reincidencia.

Última línea de validación documentada:

- Backend: **118/118**.
- Web: **176/177** (un fixture de mock conocido).
- Mobile: **210/210** con mocks.
- TypeScript/build Web: aprobado.
- RBAC HTTP aislado: 99 solicitudes aprobadas.
- E2E operacional y de Laboratorio: aprobados en entorno aislado.

## Brechas de cierre que no deben ocultarse

- Validación nativa completa de cámara/lector/Safe Area en dispositivo.
- Cierre del fixture Web pendiente.
- Pruebas dedicadas de rendimiento/seguridad en entorno descartable.
- **Docker:** el instructivo Capstone lo solicita como evidencia de despliegue; el proyecto actual opera con servicios nativos y todavía no dispone de Dockerfile/docker-compose vigentes. Debe implementarse o formalizarse con el docente antes de la entrega final.
- Finalizar la evidencia individual de Matías Garrido y Luis Arenas para Fase 2 si corresponde.

## Repositorio

El repositorio público es la evidencia central de evolución, conforme al Instructivo CAPSTONE 2026. No versionar secretos, archivos `.env`, service accounts, dumps privados ni contraseñas.
