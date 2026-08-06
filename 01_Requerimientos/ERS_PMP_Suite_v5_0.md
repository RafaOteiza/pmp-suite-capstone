# Especificación de Requisitos de Software (ERS) - PMP Suite v5.0 (Gold & Predictive AI Edition)

## 1. Introducción
**PMP Suite** es una plataforma tipo ERP logístico de alto desempeño, diseñada para la gestión cíclica del mantenimiento de dispositivos tecnológicos (Validadores y Consolas) en flotas de transporte público. La versión 5.0 representa la consolidación final del sistema, integrando capacidades avanzadas de trazabilidad con sistemas externos (Aranda Bridge), una interfaz premium de última generación, un motor de base de datos optimizado para concurrencia masiva y un **Módulo de Inteligencia Artificial** para la predicción de fallas.

---

## 2. Requisitos Funcionales (RF)

### 2.1 Módulo Móvil y Operaciones en Terreno
- **RF-M01: Autenticación Unificada:** Ingreso de técnicos asegurado bajo Firebase Auth y validado contra los registros de la base de datos PostgreSQL.
- **RF-M02: Creación de OS de Retiro:** Generación de Órdenes de Servicio vinculadas a PPU del bus y número de serie del equipo.
- **RF-M03: Autocompletado de Maestros:** Selección sincronizada en tiempo real de Terminales y PST.
- **RF-M04: Manejo Exigido de POD:** Captura obligatoria de evidencia fotográfica para equipos críticos.
- **RF-M05: Validación Activa de Input:** Transformación de PPU a mayúsculas y aplicación de validaciones por Expresión Regular.
- **RF-M06: Carga de Evidencias:** Envío de imágenes adjuntas a la OS para auditoría visual.
- **RF-M07: Auto-registro de Nuevas Patentes:** Inserción dinámica de buses no registrados (`ON CONFLICT DO NOTHING`).
- **RF-M08: Consulta Inteligente de Tickets Aranda:** Implementación de autocompletado en terreno para vincular la OS física con el ticket lógico de la plataforma ITSM del mandante.

### 2.2 Módulo de Bodega y Logística de Hardware
- **RF-B01: Monitor Central en Tiempo Real:** Visualización instantánea de equipos entrantes desde la calle o rebotados desde QA/Laboratorio.
- **RF-B02: Recepción Lógica y Física:** Estampado de entrada e inyección a la ubicación "Bodega Mersan".
- **RF-B03: Loop de Re-Instalación Automatizado:** Si el equipo es aprobado en QA, el sistema cierra la OS de reparación y genera automáticamente una OS de instalación (`IN-XXXX`).
- **RF-B04: Reasignación de Activos (Despacho a Calle):** Asignación de equipos disponibles a técnicos de terreno para re-instalación.
- **RF-B05: Manejo Integral de Repuestos:** Control de stock crítico y consolidado de consumibles.
- **RF-B06: Entrega Restrictiva de Insumos:** Descuento directo de stock al entregar repuestos al laboratorio.

### 2.3 Módulo de Laboratorio (Taller Técnico)
- **RF-L01: Gestión Especializada por Colas:** Separación de flujos operativos para Validadores y Consolas.
- **RF-L02: Intervención Técnica (Bitácora):** Registro detallado de fallos, reparaciones y repuestos utilizados.
- **RF-L03: Retención por Insumos:** Bloqueo de avance en estado "Espera de Repuesto" con alerta a logística.
- **RF-L04: Despachos por Lote:** Envío masivo de equipos finalizados hacia Control QA.

### 2.4 Módulo de Aseguramiento de Calidad (QA)
- **RF-Q01: Flujo de Aprobación/Rechazo:**
  - ***Aprobado:*** Retorna a "Disponible" y habilita equipo para despacho.
  - ***Rechazo:*** Fuerza el retorno al laboratorio para nueva intervención.

### 2.5 Administración, Indicadores y Control
- **RF-A01: Dashboards Premium (Analytics):** Visualización de KPIs mediante gráficos Doughnut e indicadores de eficiencia sectorial.
- **RF-A02: Sistema de Notificaciones (Badges):** Indicadores visuales en el Sidebar con conteos en tiempo real de pendientes.
- **RF-A03: Auditoría Trazable Completa (Global Search):** Nueva interfaz premium para búsqueda cruzada por OS, Ticket Aranda o Serie.
- **RF-A04: Gestión de Usuarios (RBAC):** CRUD de perfiles vinculado a Firebase Auth con Custom Claims.
- **RF-A05: Integración ITSM Aranda Bridge:** Sincronización proactiva que permite auditar el ciclo de vida de un activo desde que se genera la falla en Aranda hasta que se reincorpora al bus.
- **RF-A06: Módulo de IA Predictiva (Anomalías):** Generación de alertas de criticidad basadas en modelos de Random Forest para la detección temprana de equipos "Limón" y tendencias de reincidencia por lote.

### 2.6 Sistema Lógico Automático Continúo (Base de Datos)
- **RF-D01: Código Auto-iterativo:** Generación de folios automáticos por trigger (`MV-` / `IN-`).
- **RF-D02: Blindaje Físico/Lógico:** Restricciones de integridad que impiden pases de fase ilegales o duplicados.
- **RF-D03: Mantenimiento Proactivo de Datos:** Scripts de saneamiento automatizado para eliminar ruido de pruebas y mantener un inventario 100% operativo.

---

## 3. Requisitos No Funcionales (RNF)

### 3.1 Seguridad e Integridad
- **RNF-S01: Escudo Bearer Token:** JWT mediante Firebase Auth.
- **RNF-S02: RBAC (Control de Acceso):** Restricción de rutas API según jerarquía operativa.
- **RNF-S03: Atomicidad Transaccional:** Uso de `FOR UPDATE` para prevenir condiciones de carrera (Deadlocks) en estados compartidos.

### 3.2 Usabilidad y Diseño (Gold Edition)
- **RNF-U01: Estética "Visual Excellence":** Interfaz de alta gama basada en **Indigo/Violet Theme**, con efectos de Glassmorphism.
- **RNF-U02: Soporte Dinámico Dark/Light Mode:** Intercambio instantáneo de paletas de colores optimizadas para descanso visual.
- **RNF-U03: Interactividad Inteligente:** Gráficos con tooltips dinámicos y micro-animaciones en componentes de búsqueda.

### 3.3 Rendimiento
- **RNF-P01: Respuesta en Tiempo Real:** Latencia de API < 300ms (P95).
- **RNF-P02: Escalabilidad Certificada:** Soporte validado para +20 transacciones por segundo mediante suite de estrés.

---
> Documento actualizado para Entrega Final — Versión 5.0 (Abril 2026)
