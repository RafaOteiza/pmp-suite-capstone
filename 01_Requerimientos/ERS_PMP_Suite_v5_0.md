# Especificación de requisitos de software PMP Suite

## 1 Introducción

PMP Suite gestiona el ciclo de mantenimiento de validadores y consolas de una
flota de transporte. La solución registra el retiro del activo, sus movimientos
entre terreno, bodega, laboratorio y QA, las intervenciones técnicas y su
posterior reinstalación.

La versión descrita corresponde a la línea base de cierre Capstone de septiembre
de 2026. El alcance considera aplicación web, API REST, PostgreSQL,
autenticación Firebase, aplicación móvil y un analizador Python de riesgo
operacional.

Esta especificación complementa la [línea base normativa Capstone v2.0](../Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md),
actualizada manualmente. Las versiones anteriores conservan carácter histórico.
Docker está fuera del alcance y la aplicación móvil mantiene Expo SDK 57.

## 2 Actores

El esquema vigente incorpora las migraciones 003–006: casos y relaciones,
correlativo IN independiente, metadata del maestro y eventos/recepción inicial
sin OS. Se preservan identificadores históricos y se usan las ubicaciones
físicas existentes; BODEGA no se representa mediante un bus ficticio.

| Actor | Responsabilidad |
|---|---|
| Administrador | Administración global, usuarios, asignaciones y control de recepción y despacho del laboratorio |
| Gerente | Consulta ejecutiva global sin escritura operacional |
| Logística | Operación de bodega, inventario, repuestos, recepciones y despachos |
| QA | Pruebas y certificación de equipos asignados |
| Técnico de laboratorio | Diagnóstico y reparación de órdenes asignadas |
| Técnico de terreno | Retiro, sustitución, creación de órdenes e instalación |

## 3 Requisitos funcionales

### 3.1 Autenticación y autorización

- **RF AUT 01** El sistema debe autenticar a los usuarios mediante Firebase.
- **RF AUT 02** El backend debe comprobar que el usuario exista y permanezca
  activo en PostgreSQL.
- **RF AUT 03** PostgreSQL debe determinar el rol efectivo utilizado para
  autorizar cada solicitud.
- **RF AUT 04** El gerente debe acceder a las consultas globales y recibir HTTP
  403 ante escrituras operacionales.
- **RF AUT 05** El administrador debe gestionar usuarios y las operaciones de
  supervisión asignadas a su rol.
- **RF AUT 06** Cada rol operacional debe acceder únicamente a su dominio y a
  los registros asignados cuando corresponda.

### 3.2 Órdenes y trabajo en terreno

- **RF TER 01** El técnico de terreno debe crear una orden indicando tipo de
  equipo, serie, bus, terminal, PST y falla reportada.
- **RF TER 02** El sistema debe validar los datos maestros y la identidad del
  técnico autenticado. El activo debe existir y estar vinculado operacionalmente
  al bus informado; reportar una falla no crea ni modifica el maestro.
- **RF TER 03** El técnico debe consultar sus órdenes e intervenciones
  asignadas.
- **RF TER 04** El sistema debe registrar qué equipo se retira y qué equipo se
  instala durante una intervención.
- **RF TER 05** Cada intervención debe conservar su activo: el mantenimiento
  MV/MC o PoD PDV/PDC del equipo retirado y la IN del equipo instalado son OS
  distintas, relacionadas explícitamente con el caso cuando corresponda.
- **RF TER 06** La aplicación móvil debe permitir crear y consultar órdenes de
  terreno.

### 3.2.1 Gestión de activos e ingreso de requerimientos

- **RF ACT 01** Gestión de activos debe registrar tipo, serie, modelo/marca conocidos,
  origen, fecha, observación y autor. El alta crea maestro y ALTA_ACTIVO; no crea OS,
  ubicación, aprobación QA ni disponibilidad automática.
- **RF ACT 02** Ingreso de requerimientos debe seleccionar un activo existente,
  mediante sugerencia por bus o buscador, y revalidar su relación operacional con
  el bus. Debe rechazar series inexistentes sin insertar maestro, caso ni OS.
- **RF ACT 03** Recepcionar activo nuevo debe exigir escaneo físico válido en BODEGA
  y conformidad inicial explícita. Debe registrar RECEPCION_INICIAL y
  HABILITADO_INSTALACION sin crear MV/MC/PDV/PDC/IN ni utilizar un bus ficticio.
- **RF ACT 04** La conformidad inicial no equivale a aprobación de reparación.
  Un activo nuevo sin falla no debe recorrer diagnóstico, reparación ni QA de reparación.
- **RF ACT 05** La carga inicial debe incorporar parque instalado y stock con
  relaciones y evidencia verificadas, sin inventar OS históricas. El importador
  masivo continúa siendo una extensión documentada, no una función implementada.

### 3.3 Bridge de correlación externa

- **RF BRI 01** Logística y administración pueden vincular tipo de equipo, serie,
  OS PMP existente, sistema externo y referencia externa (por ejemplo OS Aranda).
- **RF BRI 02** Bridge no debe asignar técnicos, crear órdenes ni mover stock.
  Las asignaciones pertenecen exclusivamente al flujo normal de OS PMP.
- **RF BRI 03** El sistema valida que la serie exista como validador o consola y
  que la OS PMP corresponda a ese activo; debe rechazar vínculos duplicados.
- **RF BRI 04** Una serie admite múltiples OS PMP y referencias externas sin
  reemplazar identificadores. Tipo y serie distinguen activos de maestros distintos.
- **RF BRI 05** El historial del activo reúne intervenciones, referencias, fechas
  y eventos. La búsqueda por serie, OS PMP u OS Aranda conduce a ese historial.

### 3.4 Identificación física

- **RF ESC 01** El sistema debe identificar validadores por serie o AMID.
- **RF ESC 02** El sistema debe identificar consolas por su serie.
- **RF ESC 03** El lector debe aceptar entrada de una pistola USB terminada con
  Enter. En recepción inicial y despacho, la digitación manual sirve para
  consulta y no debe habilitar la confirmación física.
- **RF ESC 04** El sistema debe comprobar tipo + serie y el contexto operacional
  antes de registrar un movimiento físico. Debe validar la OS cuando exista;
  la recepción inicial valida directamente el activo registrado sin exigir OS.
- **RF ESC 05** Los escaneos deben registrar usuario, estación, fecha, resultado
  e identidad del activo, y la OS relacionada cuando corresponda. Los eventos
  ALTA_ACTIVO, ESCANEO_BODEGA, RECEPCION_INICIAL y HABILITADO_INSTALACION pueden
  existir sin OS.
- **RF ESC 06** La pantalla de escaneo debe presentar el contexto y la siguiente
  acción permitida sin exigir un cambio de pantalla.
- **RF ESC 07** Bodega, laboratorio y QA deben exigir una lectura reciente de su
  estación para confirmar acciones físicas.

### 3.5 Bodega y logística

- **RF LOG 01** Logística debe visualizar los equipos pendientes de recepción y
  despacho.
- **RF LOG 02** Bodega debe confirmar la recepción de equipos enviados desde
  terreno, laboratorio o QA.
- **RF LOG 03** Logística debe despachar equipos hacia laboratorio o QA según el
  estado de la orden.
- **RF LOG 04** Logística debe administrar inventario y stock de repuestos.
- **RF LOG 05** El sistema debe registrar solicitudes y entregas de repuestos
  asociadas a una orden.
- **RF LOG 06** Listos para instalación debe incluir stock inicial recibido y
  conforme, y stock reparado aprobado por QA, físicamente en Bodega y elegible.
- **RF LOG 07** La selección para instalación debe ser physical-first: definir
  caso/contexto, tomar un activo y escanearlo. Solo al confirmar el despacho se
  crea la IN, se asigna técnico y se registra SALIDA_BODEGA_TERRENO atómicamente.
- **RF LOG 08** Cada IN debe usar el correlativo PMP independiente `IN-xxxxxx`,
  nunca el número del caso Aranda. Recibir desde QA no crea una IN anticipada.
- **RF LOG 09** Equipos en operación debe mostrar activos instalados y operativos,
  sin ofrecerlos como stock. Disponible para instalación, Asignado a técnico y
  En ruta son conceptos separados; seleccionar técnico o escanear no suma En ruta.

### 3.6 Laboratorio

- **RF LAB 01** El administrador debe asignar una orden a un técnico de
  laboratorio activo.
- **RF LAB 02** El administrador debe confirmar la recepción y el despacho
  físico del equipo en laboratorio.
- **RF LAB 03** El técnico debe visualizar únicamente su carga asignada.
- **RF LAB 04** El técnico asignado debe iniciar, documentar y completar la
  reparación.
- **RF LAB 05** El técnico debe registrar falla detectada, acción realizada,
  prueba y resultado.
- **RF LAB 06** El técnico debe solicitar repuestos cuando la reparación lo
  requiera.
- **RF LAB 07** El sistema debe impedir que otro técnico modifique una orden no
  asignada.

### 3.7 Control de calidad

- **RF QA 01** Bodega debe enviar a QA únicamente equipos con reparación
  registrada.
- **RF QA 02** Cada orden debe quedar asignada a un usuario QA activo.
- **RF QA 03** QA debe consultar únicamente las certificaciones que tenga
  asignadas.
- **RF QA 04** QA debe registrar las pruebas y aprobar o rechazar el equipo.
- **RF QA 05** Un rechazo debe exigir una observación y devolver el equipo al
  circuito de corrección.
- **RF QA 06** Una aprobación debe enviar el equipo a bodega para quedar
  disponible después de su recepción.

### 3.8 Consulta y trazabilidad

- **RF TRA 01** Admin y gerente deben consultar todas las órdenes.
- **RF TRA 02** El sistema debe buscar por código de orden, serie, bus y
  responsable.
- **RF TRA 03** La trazabilidad debe mostrar estados, ubicaciones, responsables,
  reparaciones, certificaciones y eventos disponibles por tipo + serie, incluso
  antes de la primera OS. El historial del caso usa relaciones explícitas y no
  fusiona la vida de activos diferentes ni reemplaza identificadores.
- **RF TRA 04** Los dashboards deben adaptar navegación, acciones e indicadores
  al rol autenticado.

### 3.9 Inteligencia operacional

- **RF IA 01** El backend debe ejecutar el analizador con el entorno Python
  aislado del proyecto.
- **RF IA 02** Admin y gerente deben consultar el reporte predictivo.
- **RF IA 03** El reporte debe utilizar datos históricos de PostgreSQL en modo
  lectura.
- **RF IA 04** Una falla del analizador debe devolver un error controlado sin
  exponer credenciales, rutas sensibles ni trazas internas.

## 4 Requisitos no funcionales

### 4.1 Seguridad

- **RNF SEG 01** Toda ruta protegida debe aplicar autenticación Firebase,
  comprobación del usuario PostgreSQL, restricción de solo lectura y permiso
  específico, en ese orden.
- **RNF SEG 02** El sistema no debe almacenar tokens de identidad en
  `localStorage`.
- **RNF SEG 03** Los intentos de escritura del gerente deben registrarse sin
  guardar tokens ni secretos.
- **RNF SEG 04** Las consultas SQL deben utilizar parámetros para datos de
  entrada.
- **RNF SEG 05** Las credenciales y archivos de entorno deben mantenerse fuera
  del control de versiones.

### 4.2 Integridad y trazabilidad

- **RNF INT 01** Las transiciones críticas deben ejecutarse dentro de una
  transacción PostgreSQL.
- **RNF INT 02** El sistema debe bloquear transiciones incompatibles con el
  estado actual.
- **RNF INT 03** Los eventos, escaneos, reparaciones y decisiones QA deben
  conservar usuario y fecha.
- **RNF INT 04** Cada orden debe referenciar un equipo maestro válido.

### 4.3 Usabilidad y accesibilidad

- **RNF USA 01** La navegación debe presentar solo las capacidades pertinentes
  al rol.
- **RNF USA 02** Los estados deben combinar texto, icono y color; el color no
  debe ser la única señal.
- **RNF USA 03** Los formularios deben incluir etiquetas, mensajes de error y
  estados de foco visibles.
- **RNF USA 04** La interfaz web debe adaptarse a resoluciones de escritorio y
  pantallas de menor ancho sin desplazamiento horizontal accidental.

### 4.4 Rendimiento y disponibilidad

- **RNF REN 01** Las operaciones normales de consulta deben responder de forma
  estable bajo la carga definida en el plan de pruebas.
- **RNF REN 02** El backend debe exponer un endpoint de salud independiente de
  la autenticación.
- **RNF REN 03** Las pruebas de carga deben ejecutarse sobre una base aislada y
  registrar configuración, volumen, latencia y errores.

### 4.5 Portabilidad y mantenimiento

- **RNF MAN 01** El repositorio debe documentar versiones, variables y comandos
  de ejecución local.
- **RNF MAN 02** Las dependencias de Node y Python deben declararse en sus
  manifiestos correspondientes.
- **RNF MAN 03** Las migraciones de base de datos deben incluir validaciones y
  una estrategia de reversión.

## 5 Restricciones

- El rol efectivo depende de PostgreSQL.
- El sistema requiere conectividad con Firebase para autenticar sesiones.
- La aplicación móvil requiere acceso de red al backend.
- Las pruebas destructivas no deben ejecutarse sobre la base principal.
- El modelo predictivo y sus umbrales solo pueden modificarse mediante una
  validación específica del módulo de IA.

## 6 Criterio de aceptación global

La versión Capstone se acepta cuando las suites automatizadas están aprobadas,
el flujo operacional completo puede reproducirse con todos los roles, los
movimientos físicos quedan respaldados por escaneos y la evidencia coincide con
los documentos de requisitos, diseño, pruebas y ejecución.
