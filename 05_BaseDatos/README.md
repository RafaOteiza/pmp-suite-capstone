# Base de Datos PMP Suite

**Versión documental:** V2.0  
**Motor:** PostgreSQL  
**Esquema:** `pmp`

## Contenido vigente
La carpeta conserva únicamente migraciones y scripts asociados a la evolución reproducible del esquema. Los respaldos locales, scripts de estrés, correcciones puntuales de usuarios y datasets de demostración fueron retirados.

## Reglas
- respaldar antes de migrar;
- ejecutar dry-run cuando exista;
- no usar la base habitual para pruebas destructivas;
- preservar integridad referencial y trazabilidad;
- no inventar OS históricas.

## Identidad
72 → CVB35, 74/75 → CVB45, Mikroelektronika. Consola → N9715 / Waysion.

## Usuarios
`pmp.usuarios` mantiene rol efectivo, estado activo y vínculo Firebase. Las contraseñas no se almacenan en PostgreSQL.
