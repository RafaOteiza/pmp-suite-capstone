# QA autónomo — requisitos vigentes

Actualización: 2026-10-07. Sustituye la coordinación de asignación QA por Admin y el dictamen que despachaba inmediatamente. Las evidencias fechadas anteriores conservan su carácter histórico.

## Responsabilidades

- **QA (`qa`)** recibe físicamente, toma su propio trabajo, registra Instalación Ambiente, pruebas, dictamen y salida hacia Bodega.
- **Admin** administra cuentas/roles y consulta; no asigna OS QA ni opera estas etapas por ser Admin.
- **Logística** confirma movimientos desde Bodega y recepciona retornos; no elige certificador ni modifica dictámenes.
- **Técnico de Laboratorio** conserva su trabajo y consulta los antecedentes QA de un rechazo; no opera QA.
- **Gerente** conserva consulta de solo lectura. No se agregan roles ni se cambia autenticación.

## Cuatro etapas excluyentes

| Etapa | Condición canónica | Acción explícita |
|---|---|---|
| Recepción | OS en circuito QA con `SALIDA_BODEGA_QA` confirmado y sin recepción vigente | Validar identidad y confirmar recepción QA |
| Instalación Ambiente | Recepción física vigente, ubicación QA, hito pendiente/en curso | Iniciar trabajo QA (toma + inicio); guardar avance y confirmar completado |
| Pruebas | Ambiente completado, sin dictamen final | Guardar avance o registrar evaluación + dictamen Operativo/Rechazado en un comando |
| Despacho | Dictamen definitivo del ciclo; equipo físicamente en QA | Nueva validación física y confirmación de salida a Bodega |

Historial es consulta secundaria de ciclos despachados. Por verificar contiene registros QA sin evidencia suficiente: ausencia de recepción no prueba tránsito. Ninguno integra los cuatro contadores activos.

## Identidad, recepción y responsabilidad

La identidad es tipo + serie. El contexto conocido de OS, activo, instalación de origen, caso y reparación se muestra readonly; la PPU histórica no implica instalación vigente.

La salida de Bodega y la recepción QA son actos distintos. Abrir, buscar y validar no reciben. La recepción se confirma por un usuario QA sin asignación administrativa previa. Registra evidencia propia, fecha de servidor, activo, OS, ciclo y receptor, y ubica el equipo en QA sin aprobarlo.

Se admite escáner físico keyboard-wedge y contingencia `MANUAL_AUTORIZADO` **del rol QA en su estación**: tipo coincidente, serie exacta, presencia explícita y motivo. No habilita a QA a operar Bodega. La captura manual nunca se almacena como SCANNER. Los intervalos de teclado son una heurística, no autenticación infalible de hardware. Digitación ordinaria no aporta esa evidencia; la estación genérica solo identifica QA y conduce a su página de recepción.

Después de recibir, Iniciar trabajo QA registra al propio usuario como responsable e inicia Ambiente en una transacción. Mantiene los eventos diferenciados de toma e inicio. Si el usuario ya era responsable, solo inicia; nunca reasigna a otro responsable. El comando anterior de toma se conserva por compatibilidad y para evaluaciones legacy con Ambiente ya completado. La fila OS se bloquea para resolver competencia entre usuarios; abrir no toma trabajo. Otro QA puede consultar, pero no sobrescribir ambiente/pruebas/dictamen. Receptor, responsable, autor del dictamen y despachador son actores independientes. Recepción y salida no exigen que su autor sea el responsable técnico.

## Instalación Ambiente

La auditoría no encontró un procedimiento técnico vigente más preciso. Se implementa exclusivamente el registro genérico: pendiente/en curso/completado, responsable, fecha de inicio/final y observación. El procedimiento detallado queda **pendiente de especificación**; no se inventan firmware, SONDA, versiones, bancos, comandos ni automatizaciones.

Iniciar, Guardar avance y Confirmar Instalación Ambiente completada son comandos separados. Solo la confirmación habilita Pruebas. No crea IN ni instala en un bus.

## Pruebas y dictamen

- Métodos fijos: Manual y Test MK. Inicialmente método vacío y resultado Pendiente. No se exige ejecutar ambos ni se integra Test MK automáticamente.
- Ejecuciones con resultado Pendiente/Aprobada/Rechazada, observación, autor y fecha del servidor. Los borradores pendientes se recuperan desde backend.
- Una ejecución concluida es inmutable; un reintento crea otra. Se conservan todos los intentos. La última ejecución de cada método aplicado determina su resultado vigente.
- Operativo: recepción válida, ambiente completado, evaluación propia completa, pruebas aplicables aprobadas, sin solicitudes de repuestos pendientes y confirmación del responsable.
- Rechazado: evaluación QA efectivamente documentada, motivo técnico obligatorio y confirmación del responsable. Admite pruebas fallidas; no exige aprobarlas ni terminar otras pendientes para documentar el rechazo.
- Dictamen único por ciclo, sin valor preseleccionado. Guardar avance no lo emite. Registrar dictamen admite la prueba introducida todavía no guardada: valida y persiste prueba + dictamen de manera atómica, con eventos propios y la misma clave idempotente. Un rechazo del comando revierte todo. Confirmarlo mantiene ubicación QA y no altera stock de repuestos.

## Despacho y retornos

Destino inmediato fijo: **Bodega**. Se requiere evidencia de salida nueva; la recepción QA no sirve. Validar, abrir o guardar no despacha. Solo Confirmar salida registra actor/fecha, ciclo, resultado, destino y disposición, y deja el equipo en tránsito hacia Bodega.

**Operativo:** dictamen en QA → salida explícita → tránsito → recepción física Bodega → stock reparado elegible. No es stock durante QA ni tránsito. No crea IN; esa OS independiente corresponde al despacho posterior para instalación.

**Rechazado:** dictamen en QA → salida explícita → tránsito → recepción Bodega → Para laboratorio → salida Bodega/Laboratorio → nueva recepción física Lab → asignación/revisión. Conserva OS/AR; antecedentes de rechazo, pruebas, responsables, observaciones y evidencia de custodia se consultan readonly. El ciclo nuevo no reutiliza recepción, cierre ni pruebas del ciclo anterior. No admite retorno directo a QA sin revisar en Laboratorio.

## Modelo, fechas y concurrencia

Se reutilizan `ordenes_servicio`, ubicación QA, campos de responsabilidad QA y eventos append-only `flujo_eventos`. No se agregan estados globales ni migraciones.

- Estado 6: tránsito hacia QA o custodia QA, diferenciados por evidencia y ubicación.
- Etapa interna: snapshot auditado `metadata.trabajo` de eventos QA versión 3; ciclo = último `SALIDA_BODEGA_QA`.
- Estado 11: salida física QA confirmada, tránsito hacia Bodega.
- Recepción Bodega: 13 si Operativo y elegible; 3 si Rechazado para laboratorio.
- Fecha QA: primera recepción confirmada del ciclo vigente, con actor propio; relecturas no reinician. Se distinguen inicio/fin de ambiente, cada prueba, dictamen, salida y recepción posterior.
- Sin SLA QA configurado: solo tiempo transcurrido. No se modifica el SLA/fecha de Laboratorio.
- Bloqueo transaccional por OS, revisión optimista y `request_id` con huella del payload. Reintento equivalente no duplica; ciclo, revisión o contenido incompatible devuelve conflicto sin cambios parciales.
- Recepción Bodega permite reintento equivalente de la misma evidencia y actor mientras conserva la recepción. No reutiliza evidencia de salida QA como recepción Bodega.

Los endpoints antiguos de asignación/inicio/proceso no escriben. Admin/Logística no obtienen una excepción; los comandos QA exigen exclusivamente `qa`. El endpoint genérico de escaneo no confirma QA silenciosamente.

Legacy físicamente recibido conserva su evidencia histórica cuando es compatible con el último ciclo; debe tomar trabajo y completar las etapas nuevas. Legacy sin evidencia permanece Por verificar. No se normaliza la base real ni se fabrican eventos.

## Navegación y contadores

`/qa` y el inicio QA `/mi-jornada` muestran Mi operación QA. Páginas `/qa/:osId/recepcion`, `/ambiente`, `/pruebas`, `/despacho` y `/detalle`. El retorno conserva pestaña, consulta y página. Búsqueda por OS/serie/AR/PPU en servidor, antes de paginar, 20 resultados por página.

Cada tarjeta y pestaña usa `qaStageSql`; el badge lateral QA es la suma de las cuatro etapas activas, para toda la operación autorizada, no solo lo tomado por un usuario. El KPI global En QA cuenta únicamente custodia QA físicamente recibida. Por verificar no se cuenta como tránsito.

Diseño con componentes/tokens PMP, tabla responsive, detalle en página y secciones expandibles; sin modales operacionales. Pruebas y límites: [QA Dashboard y flujo autónomo](../08_Pruebas/QA_Dashboard_Flujo_Autonomo.md).

## Interacción simplificada (2026-10-07)

- Entrada principal QA: **Mi trabajo QA** (`/qa`). `/mi-jornada` mantiene compatibilidad y las rutas de las etapas siguen vigentes. Consulta e identificación son herramientas secundarias.
- Capturar → coincidencia → **Recibir equipo** o **Confirmar salida a Bodega**. El botón es la confirmación explícita; no requiere otra casilla que repita el mismo movimiento. La contingencia **No puedo escanear** conserva serie, motivo y declaración de presencia manual, sin preseleccionarla.
- Identidad, etapa, responsable y origen/destino de movimientos permanecen visibles. Contexto ampliado, antecedentes, pruebas concluidas e historial se consultan inline bajo demanda. La auditoría completa se conserva.
- Pruebas: método sin seleccionar, resultado Pendiente y dictamen sin seleccionar. Guía neutral de requisitos faltantes. El responsable decide explícitamente; nunca se deriva Operativo de una prueba aprobada.
- Navegación interna con cambios: aviso inline, seguir trabajando o salir conservando borrador local. Al volver se ofrece recuperar/descartar; una revisión distinta requiere revisión explícita. Nunca se recupera una validación física ni una casilla de presencia como consentimiento.
- Los reintentos tras fallo de red conservan exactamente acción, revisión, ciclo, contenido y `request_id`; el servidor devuelve el resultado ya registrado sin duplicar. Una consulta fallida después de guardar no convierte un comando exitoso en fallo.
- El almacenamiento local es de sesión, separado por usuario, OS y ciclo; no es un guardado backend ni opera sin conexión. Cerrar la pestaña puede eliminarlo. El bloqueo inline cubre navegación del router; recarga/cierre del navegador no admiten ese aviso inline y requieren guardar previamente.

La simplificación no resuelve el procedimiento técnico pendiente de Ambiente. La prueba con operadores reales y la validación de ese procedimiento siguen siendo condiciones pendientes del producto.
