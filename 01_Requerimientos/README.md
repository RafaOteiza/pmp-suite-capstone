# PMP Suite — Requerimientos V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026

La documentación V2.0 define el contrato funcional y no funcional del sistema vigente. La fuente principal es la ERS exhaustiva; los documentos modulares explican cada dominio con sus actores, flujos, reglas, casos negativos y criterios de aceptación.

## 1. Documento maestro

[ERS_PMP_Suite_V2.0.md](ERS_PMP_Suite_V2.0.md)

La ERS incluye:

- alcance y definiciones;
- siete roles;
- reglas de negocio transversales;
- autenticación/usuarios;
- activos/recepción inicial;
- casos/requerimientos;
- nomenclatura y relaciones OS;
- Terreno;
- Bodega/Logística;
- Laboratorio;
- repuestos;
- QA;
- inventario/instalación;
- Bridge/trazabilidad;
- dashboards/reportes;
- analítica;
- Web/Mobile;
- requisitos no funcionales;
- criterios de aceptación.

## 2. Requisitos por dominio

- [Administración y Supervisión](Administracion_General_Requerimientos_V2.0.md)
- [Autenticación, Usuarios y RBAC](Auth_Users_Requerimientos_V2.0.md)
- [Bodega y Logística](Bodega_Logistica_Requerimientos_V2.0.md)
- [Laboratorio](Laboratorio_Requerimientos_V2.0.md)
- [QA](QA_Requerimientos_V2.0.md)
- [OS, Casos e Intervenciones](OS_Requerimientos_V2.0.md)
- [Inteligencia Operacional](IA_Requerimientos_V2.0.md)

## 3. Trazabilidad

La matriz técnica vigente es:

[08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md](../08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md)

Relaciona:

```text
Requisito
→ dominio/componente
→ endpoint/servicio
→ regla de datos
→ verificación
→ evidencia
```

No se mantiene una segunda matriz documental desactualizada en paralelo.

## 4. Arquitectura relacionada

- [Arquitectura Integral](../02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md)
- [Modelo de Datos](../02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md)
- [Catálogo API](../02_Arquitectura/CATALOGO_API_V2.0.md)
- [Estados y Eventos](../02_Arquitectura/MODELO_ESTADOS_EVENTOS_V2.0.md)

## 5. Procesos de negocio

- [Problemática](../Documentacion%20Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md)
- [BPMN AS-IS](../Documentacion%20Capstone/BPMN/BPMN_AS_IS_V2.0.md)
- [BPMN TO-BE](../Documentacion%20Capstone/BPMN/BPMN_TO_BE_V2.0.md)
- [Casos de Uso](../Documentacion%20Capstone/06_CASOS_DE_USO_Y_ESCENARIOS_V2.0.md)

## 6. Principios obligatorios

- activo = tipo + serie;
- modelo/marca autoritativos;
- Physical First;
- evidencia independiente por movimiento;
- caso ≠ OS ≠ activo ≠ referencia;
- Admin sin wildcard;
- Gerente read-only;
- Jefe Laboratorio separado de Técnico Lab;
- QA autónomo;
- técnico Lab sin inventario;
- Bridge solo correlación;
- IN al despacho físico;
- stock inicial sin OS;
- error ≠ vacío ≠ cero;
- autocompletado de datos conocidos.

## 7. Criterio documental

Si el código cambia una regla de negocio, deben actualizarse en la misma línea:

1. ERS;
2. documento modular;
3. arquitectura/datos si aplica;
4. matriz de trazabilidad;
5. prueba/evidencia.

La V2.0 no mantiene documentos contradictorios como fuentes paralelas.
