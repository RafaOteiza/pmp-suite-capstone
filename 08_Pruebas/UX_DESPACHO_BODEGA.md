# UX del despacho desde Bodega

## Resultado

El error de despacho se muestra dentro del modal de asignación mediante una alerta accesible que recibe foco. El modal permanece abierto y conserva técnico y patente. Se eliminó el segundo modal de error de esta página.

En **Inventario de equipos → Listos para instalación** cada equipo muestra `✓ Escaneado en Bodega` o `⚠ Pendiente de escaneo`. Sin validación, **Asignar y despachar** permanece deshabilitado con explicación y un enlace **Escanear en Bodega**. El escáner abre en otra pestaña para conservar el formulario. Al volver se consulta nuevamente la validación; también existe actualización manual.

La API de stock incorpora `escaneado_bodega`, calculado con el último escaneo VALIDADO de la OS y comprobando estación BODEGA, tipo y serie, de acuerdo con la validación existente. Es una consulta: no registra movimientos ni asignaciones.

Si la API rechaza el despacho con `PHYSICAL_SCAN_REQUIRED` por una validación que dejó de ser vigente, la alerta aparece inmediatamente dentro del formulario y se bloquea la confirmación hasta actualizar la validación. Otros errores 4xx también se muestran inline. Un fallo al consultar la validación impide habilitar el despacho con información desactualizada.

Seleccionar técnico, completar patente, consultar stock o escanear **no confirma el despacho**. Se conserva la validación backend y el flujo existente: únicamente confirmar correctamente el despacho genera `SALIDA_BODEGA_TERRENO` y el paso a **En ruta**.

## Archivos de esta corrección

| Archivo | Cambio |
| --- | --- |
| `03_Backend/pmp-api/src/routes/bodega.routes.js` | Indicador de escaneo en la lectura de stock. |
| `04_Frontend/src/api/bodega.ts` | Tipo del indicador de validación. |
| `04_Frontend/src/pages/BodegaModulosPage.tsx` | Alerta inline, conservación del formulario, estado físico, bloqueo del CTA y actualización. |
| `04_Frontend/test/warehouse-dispatch.frontend.test.mjs` | Seis pruebas del componente real. |
| `04_Frontend/package.json` | Dependencia de pruebas y ejecución de la nueva suite. |
| `04_Frontend/package-lock.json` | Dependencias de desarrollo de React Test Renderer 18.3.1. |
| `03_Backend/pmp-api/verification/logistics_nomenclature_e2e.mjs` | Aserciones del indicador antes y después del escaneo sobre la base aislada. |

No se modificaron Bridge, correlación externa, FSM, estados, permisos, migraciones, reglas de escaneo ni mobile en esta corrección. No se agregó Docker. Se conservaron los cambios previos del proyecto.

## Verificación automatizada

| Comando | Resultado |
| --- | --- |
| Backend: `npm test` | 49/49 aprobadas. |
| Frontend: `npm test` | 49/49 aprobadas, incluidas seis nuevas. |
| Frontend: `npm run build` | Aprobado. |
| `node verification/logistics_nomenclature_e2e.mjs` | Aprobado. |
| `node verification/equipment_scan_flow_e2e.mjs` | Aprobado. |
| `node verification/bridge_correlation_e2e.mjs` | Aprobado. |

Las nuevas pruebas frontend verifican un 409 visible dentro del único modal, conservación de técnico/patente, bloqueo sin escaneo, habilitación al actualizar, recuperación tras rechazo, otro 422 inline y actualización al regresar de la pestaña del escáner. Comprueban que seleccionar campos y refrescar no envían un despacho.

Los E2E usan bases efímeras y verificaron su eliminación y que la base de origen permaneciera sin cambios. Evidencias en [evidencias/ux-despacho-bodega](evidencias/ux-despacho-bodega/). No se realizó una comprobación visual manual en navegador en esta ejecución.

## Guión manual

Preparación: reiniciar la API y servir el frontend actualizado. No requiere migración. Usar una cuenta de Logística y equipos de prueba elegibles para instalación.

1. Abrir **Inventario de equipos → Listos para instalación** con un equipo sin escaneo válido para su OS. Comprobar **⚠ Pendiente de escaneo**, explicación y **Asignar y despachar** deshabilitado.
2. Abrir **Escanear en Bodega** y realizar el escaneo físico por el flujo existente en estación BODEGA. Regresar al inventario; si fuera necesario pulsar **Actualizar**. Comprobar **✓ Escaneado en Bodega** y CTA habilitado. El equipo todavía no debe pasar a En ruta ni registrar `SALIDA_BODEGA_TERRENO` por este escaneo.
3. Abrir **Asignar y despachar**, seleccionar técnico y patente. Antes de confirmar, comprobar que no se ha registrado un despacho. Cancelar y verificar que el equipo continúa en stock.
4. En un entorno de prueba, simular una respuesta HTTP 409 del endpoint de despacho con `error: PHYSICAL_SCAN_REQUIRED` y el mensaje de escaneo, mediante la herramienta de interceptación HTTP del entorno. Confirmar con técnico y patente completos. Verificar que hay un solo modal, la alerta es visible dentro de él, los campos conservan su selección y la confirmación queda bloqueada. Este caso también está cubierto por la prueba automatizada del componente.
5. Retirar la simulación, realizar el escaneo válido si corresponde y pulsar **Actualizar validación** en el formulario. Verificar que se conservan los campos y vuelve a habilitarse la confirmación sin despachar automáticamente.
6. Confirmar el despacho. Verificar el cierre del modal, mensaje de éxito, salida del equipo de la lista de stock, evento `SALIDA_BODEGA_TERRENO` y estado **En ruta**. Comprobar que el contador de En ruta cambia con este despacho confirmado.
