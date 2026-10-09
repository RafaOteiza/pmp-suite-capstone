# PMP Suite — V2.0

PMP Suite es una plataforma para centralizar la gestión operacional y la trazabilidad del ciclo de mantenimiento de validadores y consolas utilizados en transporte público.

**Versión documental:** V2.0  
**Actualización:** 09-10-2026

## Problema

El proceso real involucra Terreno, Bodega/Mersan, Laboratorio, QA, analistas y gestión PoD. La información puede quedar distribuida entre planillas, correos, guías, tarjetones y registros independientes, dificultando determinar identidad, ubicación, custodia, diagnóstico, reparación, QA, stock e historial.

Detalle: [Problemática y contexto](Documentacion%20Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md).

## Solución

PMP Suite integra:

- activos;
- requerimientos/casos;
- OS;
- Terreno;
- Bodega;
- Laboratorio;
- QA;
- repuestos/stock;
- Bridge;
- trazabilidad;
- dashboards;
- Mobile;
- analítica;
- usuarios/RBAC.

## Arquitectura

```text
Web React/Vite ─┐
                ├── API Node/Express ─── PostgreSQL
Mobile Expo ────┘           │
                            ├── Firebase
                            └── Python
```

Documentación: [Arquitectura Integral](02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md).

## Principios V2.0

- identidad = tipo + serie;
- 72→CVB35, 74/75→CVB45, Consola→N9715;
- Physical First;
- evidencia por movimiento/ciclo;
- Admin sin wildcard;
- Gerente read-only;
- Jefe Lab separado;
- QA autónomo;
- técnico Lab sin inventario;
- Bridge solo correlación;
- IN creada al despacho Bodega→Terreno;
- historial append-only.

## Roles

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

## Flujo TO-BE

```text
Operación
→ Falla/Retiro
→ Bodega
→ Laboratorio
→ Bodega
→ QA
→ Bodega
→ Despacho/IN
→ Terreno
→ Operación
```

BPMN: [AS-IS](Documentacion%20Capstone/BPMN/BPMN_AS_IS_V2.0.md) · [TO-BE](Documentacion%20Capstone/BPMN/BPMN_TO_BE_V2.0.md)

## Documentación técnica

### Requerimientos

- [ERS completa V2.0](01_Requerimientos/ERS_PMP_Suite_V2.0.md)
- [Requisitos por dominio](01_Requerimientos/README.md)

### Arquitectura y datos

- [Arquitectura Integral](02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md)
- [Modelo de Datos / Diccionario](02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md)
- [Catálogo API](02_Arquitectura/CATALOGO_API_V2.0.md)

### Análisis funcional

- [Problemática](Documentacion%20Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md)
- [Casos de Uso](Documentacion%20Capstone/06_CASOS_DE_USO_Y_ESCENARIOS_V2.0.md)
- [Reportes y KPI](Documentacion%20Capstone/07_REPORTES_KPI_V2.0.md)

### Calidad

- [Informe de Pruebas](08_Pruebas/INFORME_PRUEBAS_V2.0.md)
- [Matriz de Trazabilidad](08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md)
- [RBAC y Seguridad](08_Pruebas/RBAC_SEGURIDAD_V2.0.md)
- [Flujos Operacionales](08_Pruebas/FLUJOS_OPERACIONALES_V2.0.md)

### Capstone

- [Documentación Capstone](Documentacion%20Capstone/README.md)
- [Artefactos Cascada](Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_V2.0.md)
- Fase 1 permanece intacta.

## Modelo de datos

El esquema `pmp` utiliza maestros, activos, casos, OS, eventos, evidencia física, reparación, QA, repuestos, guías y referencias. El inventario verificado clasifica 26 tablas.

## API

La API está organizada por dominio en `03_Backend/pmp-api/src/routes` y servicios en `src/services`. El catálogo actual documenta endpoints, permisos y propósito.

## Ejecución

### Backend
```powershell
cd 03_Backend\pmp-api
npm install
npm run dev
```

### Web
```powershell
cd 04_Frontend
npm install
npm run dev
```

### Mobile
```powershell
cd 07_Mobile
npm install
npx expo start
```

### IA
```powershell
cd 06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Estado de pruebas

- Backend: **118/118**.
- Web: **176/177**.
- Mobile con mocks: **210/210**.
- Build Web: aprobado.
- RBAC HTTP aislado: **99 solicitudes**.
- E2E Laboratorio: aprobado.
- E2E operacional: aprobado.
- Responsive/RBAC: **150 renders**.

## Pendientes declarados

- corregir fixture Web;
- validar cámara/lector/Safe Area en dispositivo;
- completar recorrido QA→Bodega→reinstalación;
- repetir rendimiento/seguridad de cierre;
- preparar presentación Fase 3.

No se presentan pendientes como funcionalidades implementadas ni simulaciones como certificación física.
