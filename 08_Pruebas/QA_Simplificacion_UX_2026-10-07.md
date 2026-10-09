# QA — simplificación de interacción

Fecha: 2026-10-07. Esta evidencia corresponde a la simplificación posterior a QA autónomo; no sustituye ni refecha resultados anteriores.

## Auditoría y resultado

Se inspeccionaron las cuatro etapas antes de editar y se renderizó la versión previa con APIs simuladas. Clasificación: **A** control necesario, **B** interacción simplificable, **C** dato secundario.

| Clase | Antes | Después |
|---|---|---|
| A/B | Identidad + casilla de movimiento + botón | Identidad + botón explícito; presencia manual conservada |
| A/B | Tomar trabajo e iniciar Ambiente separados | Iniciar trabajo QA, una transacción y dos hitos auditados |
| A/B | Guardar prueba antes de poder dictaminar | Prueba nueva + dictamen atómicos; Guardar avance sigue independiente |
| B | Dashboard QA y Operación QA | Mi trabajo QA; enlaces anteriores siguen válidos |
| B | Contadores en tarjetas y otra vez en pestañas | Una fila de pestañas con conteos; sin tarjetas duplicadas |
| C | Contexto amplio antes de operar, campos vacíos y tabla completa al despachar | Identidad/origen/destino visibles; contexto y resultados cerrados bajo demanda |
| B | Borrador sin protección al navegar | Aviso inline, seguir aquí o conservar copia local; recuperación explícita |
| B | Fallo de red con nuevo identificador al reintentar | Misma solicitud, revisión y ciclo; no duplica eventos ni pruebas |
| B | Etiquetas genéricas, “1 resultados”, rol “Qa” | Acciones por etapa, singular, QA; página siguiente deshabilitada cuando no existe |

## Recorridos finales

- **Recepción:** capturar → comprobar coincidencia → Recibir equipo. “No puedo escanear” abre serie exacta, motivo y presencia; validar no recibe.
- **Ambiente:** Iniciar trabajo QA hace responsable al usuario e inicia. Guardar avance conserva notas; completar sigue siendo otro hito explícito.
- **Evaluación:** elegir método/resultado → elegir dictamen → Registrar dictamen; incluye la prueba nueva válida. Rechazado exige motivo. Puede guardarse avance sin dictamen.
- **Despacho:** nueva captura → coincidencia → Confirmar salida a Bodega. La recepción anterior no habilita esta salida. Operativo/Rechazado mantienen los retornos existentes.

## Comparación de acciones

Unidad: activación de un control, lectura o entrada de un campo; no pulsaciones por carácter, tiempo de usuario ni clics internos del selector del navegador. Se excluye abrir la ficha. Caso normal con una prueba Manual aprobada, sin notas opcionales. Rechazo suma el motivo en ambas versiones.

| Recorrido | Acciones antes → después | Declaraciones/confirmaciones antes → después | Datos obligatorios antes → después |
|---|---:|---:|---|
| Recepción escáner | 3 → 2 | 2 → 1 | Lectura → lectura |
| Recepción manual | 7 → 6 | 3 → 2 | Serie y motivo → iguales |
| Iniciar trabajo libre | 2 → 1 | 2 botones → 1 botón | Ninguno → ninguno |
| Evaluación + dictamen | 6 → 4 | Casilla + botón → botón | Método, resultado y dictamen → iguales |
| Despacho escáner | 3 → 2 | 2 → 1 | Lectura nueva → lectura nueva |

La declaración manual de presencia es una de las dos confirmaciones restantes. Los datos técnicos no se preseleccionan ni se reducen; se elimina interacción redundante.

Desplazamiento mínimo en **píxeles** para ver completo el botón principal, viewport de 950 px de alto, tema claro, fixtures equivalentes, detalles cerrados. Medición geométrica del navegador, no observación de usuarios. Se mide antes de capturar/rellenar; los mensajes posteriores pueden cambiar la altura.

| Recorrido | Ancho 375 px: antes → después | Ancho 1440 px: antes → después |
|---|---:|---:|
| Recepción escáner | 490 → 0 | 151 → 0 |
| Recepción manual | 615 → 66 | 321 → 0 |
| Evaluación + dictamen | 970 → 134 | 562 → 0 |
| Despacho escáner | 1045 → 38 | 560 → 0 |

La página anterior mostraba 1–2 “Sin registro” en estos fixtures; ahora no expone campos opcionales vacíos. Se mantiene el dato conocido en Detalles del equipo. Las advertencias reales permanecen visibles.

## Cambios técnicos mínimos

- `iniciar` bloquea la OS, comprueba recepción/etapa/propietario/revisión y registra toma + inicio en la misma transacción. Un competidor pierde sin reasignación ni avance parcial.
- `dictamen` acepta `prueba` opcional. Reutiliza la validación de evaluación y aplica el dictamen antes de confirmar la transacción. Conserva intentos concluidos y añade uno nuevo; un error revierte todo.
- Idempotencia con la misma clave/ciclo/actor/contenido. Frontend conserva el comando ambiguo tras caída de red y ofrece reintento exacto. No encadena guardado y dictamen desde el cliente.
- Router de datos mínimo con las mismas rutas de `App`, sin loaders/actions nuevos, para usar `useBlocker` también con Atrás. `InlineFeedback` existente muestra el aviso; sin modales.
- Borrador local en `sessionStorage`, por usuario/OS/ciclo; no es guardado backend ni modo offline. La recuperación no revalida identidad ni marca presencia automáticamente. Una revisión distinta se advierte antes de recuperar.
- Se reutilizan PageHeader, StatusBadge, FeedbackBanner, InlineFeedback, EmptyState, pestañas, tabla responsive, botones, inputs, Lucide y tokens PMP. Los ajustes de densidad son exclusivos de QA.

## Validación

- Backend: **79/79** (`npm test`).
- Frontend: **174/174** (`npm test`); incluye regresiones de consumidores existentes.
- TypeScript: aprobado (`tsc --noEmit --incremental false`). Build Vite: aprobado.
- E2E backend: **20 grupos de escenarios**, exit code 0, PostgreSQL efímero eliminado. Comparación de todas las tablas `pmp` de origen: `sourceDatabaseUnchanged: true`; `temporaryClusterRemoved: true`.
- Navegador Chrome con APIs simuladas: **400 renderizados**, seis anchos (320/375/390/768/1024/1440), claro/oscuro, cero overflow horizontal, cero diálogos operacionales, cero conexiones backend. Incluye 172 capturas QA y regresión de Lab/Bodega/formularios compartidos.
- Cuatro recorridos QA completos (320 y 1440, ambos temas), además de recepción mediante secuencia keyboard-wedge simulada. Foco visible por Tab, bloqueo inline de Atrás y restauración de búsqueda/página/scroll comprobados.
- Reejecución final de los cuatro recorridos tras el ajuste de recuperación de errores: aprobada (`tmp/qa-ux-journeys-result.json`). Se corrigió en el arnés una espera que consultaba `document.body` antes de existir tras recargar; no era un fallo del flujo QA.
- Revisión visual directa de capturas de bandeja, recepción, contingencia móvil, evaluación móvil y despacho validado. No equivale a validación con usuarios.

Cobertura: roles insuficientes/otro responsable; recepción escáner y manual; identidad errónea; toma concurrente; revisión antigua; prueba incompleta; rechazo/Operativo; doble solicitud/reintento de respuesta perdida; rollback del comando compuesto; retests y ciclos conservados; evidencia propia al salir; retornos físicos y stock/IN existentes. El navegador verifica navegación con borrador, Atrás, recuperación, foco por teclado y vuelta con búsqueda/página/scroll. Abrir vistas nunca confirma operaciones.

Evidencias locales: `tmp/qa-ux-{backend,frontend-final,e2e,e2e-stderr,typescript,build-final,browser-final}.log`, `tmp/qa-ux-metrics.json`, y `tmp/qa-ux-visual-final/{report,journeys}.json`. El log E2E puede incluir el rechazo esperado de un activo inexistente; el resultado válido se identifica por exit code 0 y el informe de aislamiento.

Capturas representativas: recepción desktop clara, recepción manual móvil oscura, evaluación móvil oscura y despacho validado. Se encuentran en `tmp/qa-ux-visual-final/` con prefijo `qa-`. No representan datos de la base real.

## Límites y pendientes priorizados

1. **Producto / QA:** definir y validar con responsables el procedimiento técnico de Instalación Ambiente. Se conserva registro genérico; no se inventan firmware/comandos ni se considera resuelto comercialmente.
2. **Laboratorio:** revisar densidad y antecedentes secundarios; extender el aviso inline de borradores de `RepairWorkForm` tras probar su revisión/partes/finalización. No copiar decisiones QA ni unir cierre con salida.
3. **Bodega:** ya tiene captura + botón y presencia manual. Priorizar coherencia de mensajes, continuidad de contexto y recuperación de fallos de red; no eliminar declaración manual ni juntar envío/recepción.
4. **Terreno:** revisar contexto secundario y textos; mantener identidad, declaración PoD y confirmación física. Mobile no fue modificado.

Recarga/cierre externo del navegador no pueden mostrar el aviso inline del router. La copia local permite recuperación mientras viva la sesión del navegador; cerrar la pestaña puede eliminarla. Guardar avance antes de cerrar sigue siendo necesario. Si el almacenamiento local falla se avisa y no se ofrece una salida silenciosa.

No se midieron tiempos humanos ni se declara “UX validada”. Las pruebas automatizadas y capturas no sustituyen la observación de usuarios ni prueban físicamente un escáner USB/Bluetooth. La heurística keyboard-wedge vigente no autentica hardware.

## Guion de observación (sin enseñar pasos)

Usar cuentas de QA, Laboratorio y Bodega y activos ficticios en un entorno aislado. Pedir que expliquen qué creen que ocurrirá antes de cada decisión. No señalar botones ni corregir hasta que terminen o soliciten ayuda.

- **QA:** “Este equipo acaba de llegar. Déjalo recibido y comienza tu trabajo”. Repetir con escáner no disponible.
- **QA:** “Documenta esta prueba y deja el equipo con el dictamen que corresponde. Ahora prepara su salida”. Incluir un caso rechazado y otro operativo.
- **QA:** “Deja una nota a medio escribir, consulta otra tarea y retoma la anterior”. Simular pérdida de respuesta del guardado.
- **Bodega:** “Te llega un equipo desde QA. Resuelve su recepción y explica qué queda pendiente”.
- **Laboratorio:** “Recibes un retorno rechazado. Encuentra el motivo y determina qué puedes hacer ahora”.

Registrar tarea completada, activaciones observadas, dudas, errores, necesidad de ayuda, expectativas sobre custodia y recuperación del borrador. Cronometrar solo sesiones reales. Separar problema de interfaz de regla de negocio que el participante necesita comprender.

## Caso real y base original

Consulta inicial **2026-10-07 18:32:57 UTC**, final **18:47:24 UTC**, ambas mediante `BEGIN READ ONLY` y `ROLLBACK`. Comparación del contexto y trabajo: idénticos.

`MV-87126356 / VALIDADOR 7490004`: recepción QA 18:19:30 UTC, responsable Cristian Alvarez, Ambiente completado, Manual aprobada, dictamen Operativo, etapa Despacho pendiente de salida. No se recibió, tomó, guardó, dictaminó, despachó ni revirtió esta OS durante el ajuste. No se ejecutaron escrituras ni scripts de prueba en la base original. El E2E comprobó además la huella de todas sus tablas antes/después. Archivos de lectura: `tmp/qa-ux-source-{before,after}.json`.

## Archivos de este ajuste

- `03_Backend/pmp-api/src/services/qaWork.js` — Inicio combinado y evaluación + dictamen atómicos; reutiliza validaciones, eventos y claves idempotentes.
- `03_Backend/pmp-api/test/qa.work.test.js` — Cobertura de pruebas inmutables, reintentos y autoría al aplicar evaluación.
- `03_Backend/pmp-api/verification/qa_custody_scenarios.mjs` — E2E concurrente, rollback, reintentos y ambos retornos QA en PostgreSQL efímero.
- `04_Frontend/src/pages/QaPage.tsx` — Bandeja Mi trabajo QA, indicadores sin duplicación, acciones por etapa, singular y scroll restaurado.
- `04_Frontend/src/pages/QaWorkPage.tsx` — Ficha compacta, contingencia bajo demanda, comandos combinados, borradores, errores y bloqueo inline.
- `04_Frontend/src/app/navigation.ts` — Una entrada principal QA y consultas secundarias; conserva rutas compatibles.
- `04_Frontend/src/main.tsx` — RouterProvider con las mismas rutas de App para bloquear navegación con useBlocker.
- `04_Frontend/src/components/UserMenu.tsx` — Presenta QA como sigla sin cambiar etiquetas de otros roles.
- `04_Frontend/src/styles/pages.css` — Densidad y responsive QA con tokens y clases PMP existentes.
- `04_Frontend/test/requirements.frontend.test.mjs` — Regresión de nuevos recorridos, error de red, lectura posterior, borrador y etiquetas.
- `04_Frontend/test/role-experience.frontend.test.mjs` — Navegación QA consolidada sin nuevos permisos.
- `04_Frontend/test/operational-pages.browser.mjs` — Renderizado y recorridos con teclado, atrás, borrador, escáner, contingencia y reintentos.
- `01_Requerimientos/QA_Requerimientos.md` — Contrato vigente de la interacción simplificada y límites del producto.
- `02_Arquitectura/Arquitectura_06_Flujos_Datos.md` — Secuencia QA con comandos atómicos y movimientos separados.
- `README.md` — Entrada principal y resumen del flujo QA simplificado.
- `08_Pruebas/QA_Simplificacion_UX_2026-10-07.md` — Auditoría breve, mediciones, evidencias, pendientes y guion de observación.
