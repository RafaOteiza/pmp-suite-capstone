# UX y Experiencia por Rol — PMP Suite V2.0

**Versión:** V2.0

## 1. Principio

PMP Suite debe ser:

> rigurosa con los datos y simple para las personas.

La complejidad de custodia, eventos y RBAC se resuelve en Backend; la interfaz presenta la siguiente acción válida.

## 2. Reglas UX

- proceso = página/panel inline;
- minimizar modales;
- feedback visible;
- contexto antes de acción;
- derivado = readonly;
- autocompletar lo conocido;
- no duplicar preguntas;
- separar validar/confirmar;
- distinguir error/vacío/cero;
- progressive disclosure.

## 3. Admin

### Ve

- dashboard ejecutivo;
- OS;
- parque;
- trazabilidad;
- supervisión Lab/Bodega/QA;
- usuarios;
- IA.

### No opera

La UI no debe ofrecer acciones físicas solo por rol Admin.

## 4. Gerente

Experiencia centrada en:

- KPI;
- gráficos;
- reportes;
- trazabilidad;
- consulta.

No botones de escritura.

## 5. Jefe Laboratorio

Flujo principal:

```text
Resumen
→ Recepción
→ Asignar carga
→ Supervisar
→ Despachar
```

Recepción usa pestañas:

- En camino;
- Recibidos;
- Incidencias;
- Historial.

## 6. Técnico Laboratorio

“Mi carga” prioriza:

- qué OS debe trabajar;
- equipo;
- falla;
- antecedentes;
- diagnóstico;
- intervención;
- pruebas;
- PoD;
- repuesto;
- resultado.

No muestra inventario global.

## 7. Logística

Experiencia asset-centric:

- parque;
- Bodega;
- recepción;
- despacho;
- inventario;
- repuestos;
- retiros;
- nueva instalación.

“Asignado” se distingue visualmente de “En ruta”.

## 8. QA

Una sola experiencia “Mi trabajo QA”.

Etapas claras:

1. Recepción.
2. Ambiente.
3. Pruebas.
4. Dictamen.
5. Salida.

No repetir grandes bloques de contexto en todas las etapas.

## 9. Técnico Terreno / Mobile

Prioriza:

- Mi jornada;
- Mis órdenes;
- instalar;
- reportar falla;
- retirar;
- historial técnico.

## 10. Historial Mobile

Solo información técnica.

No:

- stock;
- costos;
- autorizadores;
- auditoría;
- IDs internos;
- fotos internas.

## 11. Autocompletado transversal

Ejemplos:

- elegir serie → modelo/marca;
- elegir bus → terminal/operador conocidos;
- elegir OS → activo/contexto;
- leer activo → contexto validado.

Si hay múltiples opciones legítimas, solicitar elección.

## 12. Identidad visual

- Navy #0D1B2A;
- Blue #1565C0;
- Teal #00B4B0.

Semántica adicional:

- verde éxito;
- ámbar warning;
- rojo error;
- azul info;
- gris neutral.

## 13. Tema

Web:

- Claro;
- Oscuro.

Mobile:

- Automático;
- Claro;
- Oscuro.

## 14. Responsive

Pruebas registran 320–1440 px.

Web mantiene densidad compacta y sidebar estable.

Mobile mantiene targets táctiles.

## 15. Estados de pantalla

Toda vista de datos debería soportar:

- skeleton/loading;
- contenido;
- vacío real;
- error;
- forbidden.

## 16. Accesibilidad

- foco visible;
- labels;
- contraste;
- icono+texto+color;
- acciones descriptivas;
- navegación teclado cuando aplica.

## 17. Pendiente conocido

En Usuarios y accesos, el editor aparece debajo de la tabla. Funciona, pero debería desplazar foco/scroll o adoptar panel lateral sin modal operacional.

## 18. Pruebas

La suite Web incluye escenarios de:

- rutas;
- roles;
- navegación;
- sistema UI;
- páginas operacionales;
- layouts;
- temas;
- responsive.
