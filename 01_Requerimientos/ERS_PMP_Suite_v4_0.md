# Especificación de Requisitos de Software (ERS) - PMP Suite v4.0

## 1. Introducción
**PMP Suite** es una plataforma tipo ERP logístico integral, diseñada para la gestión cíclica del mantenimiento de dispositivos tecnológicos (Validadores y Consolas) en flotas de transporte público. Este documento detalla la totalidad de los requisitos funcionales y no funcionales que rigen el sistema en su versión actual integral, cubriendo Terreno, Bodega, Laboratorio y Control de Calidad.

---

## 2. Requisitos Funcionales (RF)

### 2.1 Módulo Móvil y Operaciones en Terreno
- **RF-M01: Autenticación Unificada:** Ingreso de técnicos asegurado bajo Firebase Auth y validado contra los registros de la base de datos PostgreSQL.
- **RF-M02: Creación de OS de Retiro:** Generación de Órdenes de Servicio vinculadas a PPU del bus y número de serie del equipo.
- **RF-M03: Autocompletado de Maestros:** Selección sincronizada en tiempo real de Terminales (ej. El Conquistador) y PST u operadores de transporte.
- **RF-M04: Manejo Exigido de POD:** Clasificación de un retiro bajo categoría POD (Point of Delivery), haciendo compulsoria la captura de evidencia fotográfica antes de proceder.
- **RF-M05: Validación Activa de Input:** Transformación de PPU a mayúsculas y aplicación de validaciones por Expresión Regular para rechazar errores de digitación en series.
- **RF-M06: Carga de Evidencias:** Conversión de las mallas fotográficas en formato URI/Base64 dentro de la OS correspondiente.
- **RF-M07: Auto-registro de Nuevas Patentes:** Inserción dinámica inteligente en el maestro de buses cuando el técnico despacha a un bus no registrado previamente (`ON CONFLICT DO NOTHING`).

### 2.2 Módulo de Bodega y Logística de Hardware
- **RF-B01: Monitor Central en Tiempo Real:** Visualización instantánea de equipos entrantes desde la calle o rebotados desde QA/Laboratorio.
- **RF-B02: Recepción Lógica y Física:** Al recepcionar el equipamiento, se estampa la llegada e inyecta la actualización física a "Bodega Mersan".
- **RF-B03: Loop de Re-Instalación Automatizado (Integridad Cíclica):** Si el equipo ingresa desde QA en estado "Aprobado", el sistema debe cerrar la orden de reparación (Estado 13) y auto-generar de forma silenciosa una OS de instalación nueva (`IN-XXXX`).
- **RF-B04: Reasignación de Activos (Despacho a Calle):** Capacidad de tomar equipos en estado "Disponible", asociar un técnico de terreno, inyectar el código del bus destino y despacharlo nuevamente a las calles.
- **RF-B05: Manejo Integral de Repuestos:** Visualización del consolidado de partes e insumos con control de "stock crítico" a la baja.
- **RF-B06: Entrega Restrictiva de Insumos:** Entrega formal de repuestos bajo solicitud hacia el laboratorio, descontando stock directamente y transicionando la OS atascada a "En Reparación".

### 2.3 Módulo de Laboratorio (Taller Técnico)
- **RF-L01: Gestión Especializada por Colas:** Distribución independiente de tareas separando el flujo operativo entre Validadores y Consolas, priorizadas por antigüedad.
- **RF-L02: Intervención Técnica (Bitácora):** Panel de diagnóstico donde el encargado consigna exhaustivamente las intervenciones, sumando partes usadas y fallos principales.
- **RF-L03: Retención por Insumos:** Bloqueo de avance en la caja de reparación estableciendo la etiqueta "Espera de Repuesto", delegando las alarmas a Bodega.
- **RF-L04: Despachos Lotes:** Selección unificada ("Checkbox masivo") de equipos finalizados y empuje directo y transaccional hacia el módulo QA.

### 2.4 Módulo de Aseguramiento de Calidad (QA)
- **RF-Q01: Flujo de Aprobación/Rechazo:**
  - ***Aprobado:*** Retorno formal del hardware a "Disponible" marcando la ubicación matriz de Bodega base.
  - ***Rechazo:*** Invalida la orden de avance, enviando la alerta y la placa de vuelta a la sala técnica de "En Diagnóstico".

### 2.5 Administración, Indicadores y Control
- **RF-A01: Paneles Gerenciales (Dashboards Especializados):**
  - KPI Dashboard Global para gerencia.
  - Dashboards Zonales dedicados a Taller o Bodega.
- **RF-A02: Sistema de Notificaciones Constantes (Badges):** Conteo continuo en el "Sidebar" de OS pendientes activas en Lab, Bodega, y QA para evitar cuellos de botella no diagnosticados.
- **RF-A03: Auditoría Trazable Completa:** Extracción de la vida útil del historial para un dispositivo específico en el tiempo.
- **RF-A04: Gestión Avanzada de Usuarios:** CRUD robusto que cruza la BD y Firebase, habilitación de links generativos de recuperación de claves y bloqueos o suspensiones de cuenta (Soft delete).

### 2.6 Sistema Lógico Automático Continuo (BD Triggers)
- **RF-D01: Código Auto-iterativo:** Motores relacionales para el cálculo UUID y secuencias formatadas como `MC-XXXXXX`.
- **RF-D02: Blindaje Físico/Lógico:** Reglas del motor Postgres que cortan transacciones si hay error con el trigger lógico (no autorizar equipos "Disponibles" si la zona GPS o ID de base no es la "Bodega").

---

## 3. Requisitos No Funcionales (RNF)

### 3.1 Seguridad Crítica Multi-Nivel
- **RNF-S01: Escudo Bearer Token:** Despliegue integral de JWT mediante Firebase Authentication interconectado.
- **RNF-S02: Rol Based Access Control (RBAC):** Blindaje frontend "URL Spoofing" y verificación backend por nivel operativo (Terreno, Logística, QA, Taller, Gestión).
- **RNF-S03: Integridad Relacional Máxima:** Transaccionalidad blindada (`BEGIN/COMMIT`) utilizando bloqueos (`FOR UPDATE`) en cambios de estado. Si un cambio falla, ningún eslabón debe grabar para preservar la sincronización de las flotas.

### 3.2 Usabilidad y Diseño Premium
- **RNF-U01: Experiencia "Visual Excellence":** Estilo dinámico con paletas de uso moderno, diseño tipográfico profundo, tarjetas de elevación adaptativa y estética "Glassmorphism".
- **RNF-U02: Transiciones Inmersivas:** Animaciones por interacción ("Skeletons" de precarga) o reacciones visuales a las entradas para mejorar significativamente el confort del usuario final.
- **RNF-U03: Soporte Claro/Oscuro:** Modificadores en el árbol de dependencias visual que invierten o adoptan automáticamente la interfaz oscura para evitar estrés en operarios de turno nocturno.

### 3.3 Rendimiento e Interoperabilidad
- **RNF-P01: Altísima Capacidad de Respuesta:** Rutas API estipuladas al límite (P95 < 300 ms) para asegurar viabilidad móvil.
- **RNF-P02: Multi-Soporte y Portabilidad:** Accesibilidad híbrida; Frontend reactivo Web para zonas de oficina y entorno de instalación móvil (React Native/Expo) exportable.
- **RNF-P03: Documentación en Tiempo Real:** Incorporación integral del panel *Swagger* para auditar los esquemas y probar todos los REST EndPoints de la aplicación.
