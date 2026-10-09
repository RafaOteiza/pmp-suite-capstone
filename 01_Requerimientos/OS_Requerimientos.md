# Requisitos de órdenes de servicio

## Propósito

La orden de servicio representa el mantenimiento o instalación de un validador
o una consola. Vincula el activo con bus, terminal, PST, responsables, estado y
registros operacionales.

## Requisitos funcionales

- **RF OS 01** El técnico de terreno debe crear una orden con datos maestros
  válidos y una falla descrita.
- **RF OS 02** Cada orden debe referenciar exactamente un validador o una
  consola existente.
- **RF OS 03** El sistema debe generar un código único según el tipo de orden.
- **RF OS 04** El administrador debe asignar órdenes de laboratorio a un técnico
  activo.
- **RF OS 05** El usuario operacional debe modificar únicamente órdenes dentro
  de su rol y asignación.
- **RF OS 06** Admin y gerente deben consultar el listado global; el gerente no
  puede crear ni modificar órdenes.
- **RF OS 07** El sistema debe permitir filtros y paginación controlada en los
  listados globales.
- **RF OS 08** La orden debe mostrar su historial de movimientos, reparaciones,
  QA e instalación cuando existan.
- **RF OS 09** Los movimientos físicos deben exigir un escaneo válido de la
  estación correspondiente.

## Requisitos no funcionales

- **RNF OS 01** Las consultas deben ser parametrizadas.
- **RNF OS 02** Las transiciones deben rechazar estados previos incompatibles.
- **RNF OS 03** Los listados deben limitar la cantidad máxima de resultados por
  página.
- **RNF OS 04** Los errores deben devolver códigos y mensajes uniformes sin
  información sensible.
- **RNF OS 05** Los registros históricos deben conservar responsable y fecha.

## Roles

- `tecnico_terreno`: creación y cierre de sus órdenes de terreno.
- `admin`: consulta global, asignaciones y administración autorizada.
- `gerente`: consulta global de solo lectura.
- `logistica`, `tecnico_laboratorio` y `qa`: acciones de su etapa mediante las
  rutas operacionales correspondientes.
