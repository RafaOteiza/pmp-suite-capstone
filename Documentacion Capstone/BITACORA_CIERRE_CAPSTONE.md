# Bitácora de cierre Capstone — PMP Suite

**Actualización:** 09-10-2026

## Propósito

Registrar el estado verificable del proyecto, las decisiones vigentes, las evidencias y las brechas que deben cerrarse antes de la entrega final.

## Estado técnico actual

| Área | Resultado documentado |
|---|---|
| Backend | 118/118 pruebas aprobadas |
| Frontend Web | 176/177; un fixture de mock pendiente |
| Mobile | 210/210 con mocks |
| TypeScript / build Web | Aprobado |
| RBAC HTTP aislado | 99 solicitudes aprobadas |
| E2E Laboratorio | Aprobado |
| E2E operacional integral | Aprobado |
| Visual responsive RBAC | 150 renderizados 320–1440 px |
| Base habitual | Sin escrituras destructivas por suites aisladas |

Los conteos 52/52, 42/42, 56/56 y similares corresponden a líneas base anteriores y se conservan únicamente en evidencias históricas fechadas.

## Decisiones vigentes

- Identidad de activo: **tipo + serie**.
- Validadores: 72→CVB35, 74/75→CVB45, Mikroelektronika.
- Consolas: N9715, Waysion.
- Custodia **Physical First**: validar identidad no equivale a confirmar un movimiento.
- Bridge correlaciona referencias externas; no crea OS ni mueve stock.
- La IN se crea al confirmar el despacho físico a Terreno.
- PostgreSQL define rol efectivo y estado activo; Firebase autentica.
- Roles oficiales: `admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.
- Admin administra y supervisa, sin wildcard operacional.
- Gerente es de consulta.
- Jefe Laboratorio controla custodia, asignación y supervisión de Laboratorio.
- Técnicos operan su carga propia/asignada.
- QA trabaja de forma autónoma dentro de su dominio.

## Activación RBAC real

Durante el 09-10-2026 se verificó manualmente la gestión de usuarios desde la aplicación y se activó la separación de roles:

- existe cuenta Administrador independiente;
- se incorporaron cuentas adicionales de Admin y Gerencia;
- Rafael Oteiza quedó con rol `jefe_laboratorio`;
- la interfaz refleja el rol actualizado.

No se documentan contraseñas ni UID.

## Estado de Fase 2

- Informe de avance: contenido actualizado y evidencia técnica disponible.
- Informe final: borrador de cierre actualizado con resultados, limitaciones e innovación.
- Diario de reflexión de Rafael: actualizado.
- Autoevaluación de Rafael: actualizada.
- Formativa y planillas de evaluación: conservadas como **plantillas oficiales**, sin adulterar.
- Evidencias individuales de los otros integrantes: deben ser completadas por cada estudiante.

## Brechas prioritarias

| Prioridad | Brecha | Tratamiento |
|---|---|---|
| Alta | Recorrido físico completo Mobile | Ejecutar cámara/QR/contingencia en dispositivo y guardar evidencia |
| Media | Fixture Web 176/177 | Corregir mock y repetir suite |
| Media | Rendimiento y seguridad | Ejecutar en entorno aislado y documentar |
| Media | Cierre QA → Bodega → reinstalación | Completar evidencia manual final |
| Media | Presentación Fase 3 | Preparar guion, arquitectura, demo y preguntas |

## Criterio de evidencia

Toda evidencia final debe identificar caso, fecha, precondiciones, datos de prueba, pasos, resultado esperado, resultado obtenido y estado. Una captura simulada no debe presentarse como prueba física.
