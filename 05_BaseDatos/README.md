# Base de Datos PMP Suite

**Motor:** PostgreSQL  
**Esquema:** `pmp`

## Contenido

- scripts históricos de corrección controlada;
- migraciones aditivas;
- utilidades de validación;
- scripts de dataset demostrativo;
- respaldo SQL histórico/local cuando corresponda.

## Reglas

- La base habitual no debe usarse para pruebas destructivas o de estrés.
- Antes de una migración real: respaldo, verificación, dry-run y plan de reversión.
- Las secuencias no se manipulan para ocultar saltos legítimos.
- No inventar OS históricas para representar parque preexistente.
- Los scripts de reinicio demo **no son** procedimientos productivos.

## Identidad

Validadores y consolas mantienen maestros separados. La identidad operacional es tipo + serie.

Regla técnica vigente:

- 72 → CVB35 / Mikroelektronika
- 74/75 → CVB45 / Mikroelektronika
- Consola → N9715 / Waysion

## Usuarios

`pmp.usuarios` contiene el rol efectivo, estado activo y `firebase_uid`. Las contraseñas pertenecen a Firebase y nunca deben guardarse en PostgreSQL.

## Migraciones

Revisar `migraciones/` y los verificadores backend antes de aplicar. Las migraciones deben ser aditivas y preservar datos históricos salvo autorización explícita.

## Dataset demostrativo

`reinicio_demo_100_equipos_*` es un conjunto destructivo preparado para entornos de demostración controlados. No ejecutar sobre una base con datos que deban conservarse.
