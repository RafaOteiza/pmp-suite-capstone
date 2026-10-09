# Custodia Bodega → Laboratorio

## Transiciones
- Confirmar salida: estado 3 → 2 (En tránsito), ubicación pendiente (NULL), destino Laboratorio derivado de SALIDA_BODEGA_LABORATORIO. El técnico del ciclo anterior deja de estar asignado.
- Confirmar lectura en Recepción laboratorio: estado 2 → 4, ubicación de tipo LABORATORIO configurada. Registra RECEPCION_LABORATORIO_CONFIRMADA además de la auditoría de escaneo vigente.
- Asignar/reasignar exige recepción del ciclo actual en backend, con bloqueo transaccional de la OS. No cambia su estado.
- Un tránsito hacia Laboratorio queda excluido de recepción en Bodega, colas técnicas, asignación y contadores de carga.

## Fecha y SLA
La recepción se obtiene de un escaneo VALIDADO en LABORATORIO para la misma OS, tipo y serie, posterior a la última salida a Laboratorio. La primera confirmación del ciclo establece su llegada; relecturas del mismo ciclo no reinician el SLA. Una nueva salida invalida esa evidencia para el siguiente ciclo.
Sin recepción del ciclo no hay fecha de ingreso ni SLA. La salida de Bodega nunca sustituye a la recepción.
Los registros legacy ya ubicados en Laboratorio, sin salida registrada ni evidencia de recepción, conservan el fallback fecha OS, rotulado «Fecha OS · ingreso no registrado». Esta compatibilidad de consulta no autoriza nuevas asignaciones sin escaneo.
Los umbrales SLA existentes no cambian.

## Contadores
Tickets en Laboratorio y Todos: carga activa recibida (estados 4, 5, 9) y registros legacy documentados ya ubicados en Laboratorio.
Pendientes: esa misma carga sin técnico. Asignados: esa misma carga con técnico.
Badge laboratorio: pendientes de esa misma consulta. Badge despacho: estado 10 físicamente en Laboratorio, excluyendo tránsito.
El resumen global contabiliza los despachos no recibidos como tránsito, nunca como taller.

## Verificación
Las suites frontend y el E2E requirements_flow_e2e.mjs cubren el reloj sin iniciar durante tránsito, bloqueo API, separación de colas/badges, recepción, asignación, recepción de nuevo ciclo y fallback legacy.
El E2E usa PostgreSQL efímero y no modifica la OS real ni sus eventos.
