# Requisitos del módulo de laboratorio

## Propósito

El módulo de laboratorio controla la recepción física, asignación, diagnóstico,
reparación y despacho de validadores y consolas. El administrador actúa como
jefatura operacional del laboratorio y el técnico ejecuta el trabajo sobre su
carga asignada.

## Requisitos funcionales

- **RF LAB 01** El administrador debe visualizar la carga completa del
  laboratorio.
- **RF LAB 02** El administrador debe asignar una orden a un técnico de
  laboratorio activo.
- **RF LAB 03** El administrador debe identificar físicamente el equipo antes de
  confirmar su recepción en laboratorio.
- **RF LAB 04** El técnico debe consultar únicamente las órdenes que tenga
  asignadas.
- **RF LAB 05** El técnico asignado debe iniciar la reparación y registrar falla
  detectada, acción realizada, prueba y resultado.
- **RF LAB 06** El técnico debe solicitar repuestos asociados a la orden cuando
  sea necesario.
- **RF LAB 07** El sistema debe bloquear la intervención de un técnico distinto
  del asignado.
- **RF LAB 08** El administrador debe identificar físicamente y despachar a
  bodega los equipos cuya reparación haya finalizado.
- **RF LAB 09** Admin y gerente deben consultar resúmenes y reportes de
  laboratorio; el gerente no puede modificar registros.

## Requisitos no funcionales

- **RNF LAB 01** Cada actualización debe validar el estado previo de la orden.
- **RNF LAB 02** Las consultas y escrituras deben usar parámetros SQL.
- **RNF LAB 03** La interfaz debe mostrar con claridad orden, equipo, falla,
  responsable y siguiente acción.
- **RNF LAB 04** Los errores no deben exponer credenciales ni trazas internas.
- **RNF LAB 05** El historial debe conservar usuario y fecha de cada acción.

## Casos de uso principales

### Asignar orden

**Actor:** administrador.

1. El administrador abre la cola pendiente.
2. Selecciona una orden y un técnico activo.
3. El backend valida rol, técnico activo, estado y recepción física del ciclo vigente. Un despacho desde Bodega no es carga asignable.
4. La orden queda visible en la carga del técnico.

### Recibir equipo en laboratorio

**Actor:** administrador.

1. Escanea la serie o AMID en la estación de laboratorio.
2. El sistema identifica el equipo y la orden activa.
3. Comprueba que el equipo fue despachado desde bodega.
4. Valida evidencia propia para recepción (escáner o contingencia manual autorizada con serie exacta, motivo y presencia).
5. Confirma explícitamente la recepción. Solo esta transacción registra llegada, inicia el SLA de Laboratorio y habilita asignación. Abrir una pantalla o validar identidad no recibe.

### Reparar equipo

**Actor:** técnico de laboratorio asignado.

1. Consulta su carga.
2. Inicia la reparación.
3. Registra el diagnóstico, la acción y las pruebas.
4. Solicita repuestos si corresponde.
5. Completa la reparación.

### Despachar a bodega

**Actor:** administrador.

1. Escanea el equipo reparado.
2. Comprueba que exista un registro técnico completo.
3. Confirma el despacho.
4. La orden queda en tránsito hacia bodega.

## Contrato vigente de custodia y trabajo — 08-10-2026

La recepción y la salida usan `labCustody`: evidencia por OS, tipo + serie,
usuario/rol, propósito, origen/destino, ciclo y revisión. La salida exige una
lectura nueva; no acepta la recepción ni un escaneo antiguo. El reintento
equivalente recupera el movimiento confirmado sin repetir eventos. Una
evidencia incompatible provoca conflicto y rollback.

La estación de escaneo identifica y abre la operación específica. La ruta
genérica de confirmación y los despachos masivos antiguos no son alternativas
operacionales. Control de salida y Despacho a Bodega reutilizan la misma vista.

El ingreso/SLA procede de la última `RECEPCION_LABORATORIO_CONFIRMADA` posterior
al envío del ciclo actual. Sin recepción no empieza el SLA. Solo registros
legacy sin ciclo físico usan la fecha OS, rotulada como ingreso no registrado.
No se cambian umbrales ni se reescriben eventos históricos.

Un rechazo QA muestra dictamen, motivo, pruebas, autor, fecha y ciclo aunque
el trabajo no sea PoD. El nuevo ciclo no hereda aprobaciones. Laboratorio
solicita un repuesto con necesidad PoD documentada; Bodega entrega y consume
una sola vez. Guardar avance o finalizar el trabajo no vuelve a consumir.

Gestión de carga cuenta OS recibidas activas (4/5/9), separadas por asignación.
Resumen muestra además las terminadas (10), listas para salida. Los tránsitos
quedan fuera. Las consultas fallidas muestran error, no cero ni una cola vacía.

## Roles

- `admin`: supervisión, asignación, recepción y despacho.
- `tecnico_laboratorio`: diagnóstico y reparación de carga asignada.
- `gerente`: consulta global de solo lectura.
