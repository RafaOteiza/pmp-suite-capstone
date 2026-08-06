# Especificación de Requisitos de Software (ERS) - PMP Suite v3.0

## 1. Introducción
**PMP Suite** es una plataforma ecosistémica diseñada para la gestión del ciclo de vida de mantenimiento de dispositivos tecnológicos en flotas de transporte público. Este documento detalla la totalidad de los requisitos funcionales y no funcionales que rigen el sistema.

---

## 2. Requisitos Funcionales (RF)

### 2.1 Módulo Móvil (Técnicos de Terreno)
- **RF-M01: Autenticación**: El técnico debe ingresar mediante Firebase Auth.
- **RF-M02: Creación de OS**: Generación de órdenes vinculadas a una PPU de Bus y Serie de Equipo.
- **RF-M03: Selección de Maestro**: Desplegables para Terminal (El Conquistador, etc.) y PST (Operadores como STP, Redbus).
- **RF-M04: Clasificación POD**: Marcado de equipos como "POD" (Point of Delivery) con requerimiento obligatorio de evidencia fotográfica.
- **RF-M05: Validación de Datos**: Transformación automática de PPU a mayúsculas y comprobación de formato de serie.
- **RF-M06: Carga Multimedia**: Captura y envío de imágenes en Base64/URI asociadas a la OS.

### 2.2 Módulo de Bodega (Logística)
- **RF-B01: Monitor de Tránsito**: Lista en tiempo real de equipos procedentes de terreno (Estado 2) o laboratorio (Estado 11).
- **RF-B02: Recepción Formal**: Registro de entrada al sistema físico (Estado 3), actualizando la ubicación a "Bodega".
- **RF-B03: Despacho a Laboratorio**: Movimiento de equipos hacia diagnóstico técnico (Estado 4).
- **RF-B04: Despacho a QA**: Envío directo a control de calidad para equipos que no requieren intervención mayor.

### 2.3 Módulo de Laboratorio (Taller)
- **RF-L01: Gestión de Colas**: Filtrado de trabajos por tipo (Validador/Consola) y prioridad por antigüedad.
- **RF-L02: Asignación de Responsable**: Capacidad de asignar un técnico específico a una OS.
- **RF-L03: Registro de Intervención**: Bitácora de "Acciones Realizadas" y "Fallas Detectadas".
- **RF-L04: Gestión de Repuestos**: Opción de marcar OS en "Espera de Repuesto" (Estado 9) vinculado a un catálogo de stock.
- **RF-L05: Finalización Técnica**: Cambio de estado a "Finalizado Taller" (Estado 10) tras completar la bitácora.

### 2.4 Administración y Dashboard
- **RF-A01: KPI Dashboard**: Visualización de 7 métricas clave: Tránsito, Bodega, Taller, Reparados en Lab, Disponibles, Operativos y PODs.
- **RF-A02: Detalle por Tipo**: Desglose gráfico de carga de trabajo (Consolas vs Validadores).
- **RF-A03: Auditoría de Historial**: Consulta cronológica del rastro de cada OS.
- **RF-A04: Gestión de Usuarios**: CRUD de usuarios con asignación de roles jerárquicos.

### 2.5 Lógica Automática (Database Triggers)
- **RF-D01: Generación de Códigos**: Creación automática de `MC-XXXXXX` (Consolas) y `MV-XXXXXX` (Validadores).
- **RF-D02: Vínculo Estado-Ubicación**: Validación por trigger que impide que un equipo esté en un estado incompatible con su ubicación física (ej: Estado 'Disponible' requiere ubicación 'Bodega').

---

## 3. Requisitos No Funcionales (RNF)

### 3.1 Seguridad
- **RNF-S01: Intercepción de Tokens**: Uso de Bearer Tokens en todas las peticiones (Firebase ID Token).
- **RNF-S02: RBAC Multinivel**: Protección de rutas mediante middlewares específicos (`requireRole`, `requireAnyRole`).
- **RNF-S03: Integridad Referencial**: Uso estricto de Foreign Keys y Restricciones en PostgreSQL.
- **RNF-S04: Concurrencia Segura**: Bloqueo de filas en base de datos (`FOR UPDATE`) durante transiciones críticas de estado.

### 3.2 Usabilidad y Diseño
- **RNF-U01: Premium UI**: Aplicación de Glassmorphism, degradados sutiles y sombras profundas para una estética premium.
- **RNF-U02: Dark/Light Mode**: Soporte nativo para cambio de tema persistente.
- **RNF-U03: Feedback Visual**: Uso de Skeleton Loaders y Micro-animaciones en transiciones.

### 3.3 Rendimiento y Soporte
- **RNF-P01: Respuesta API**: P95 sub-300ms para consultas de lectura.
- **RNF-P02: Portabilidad**: Web accesible en Chrome/Safari y Mobile operativo en Android/iOS (vía Expo).
- **RNF-P03: Documentación Viva**: Swagger UI integrado para pruebas y referencia técnica de la API.

---

## 4. Matriz de Estados (Core Business Logic)

| ID | Nombre | Ubicación Asociada | Acción Clave |
| :--- | :--- | :--- | :--- |
| 2 | En Tránsito | Tránsito | Creación en App |
| 3 | Recibido Bodega | Bodega | Confirmación Logística |
| 4 | En Diagnóstico | Laboratorio | Ingreso Taller |
| 5 | En Reparación | Laboratorio | Trabajo en Curso |
| 9 | Espera Repuesto | Laboratorio | Pausa por Stock |
| 10 | Finalizado Taller | Laboratorio | Registro Bitácora |
| 6 | En QA | QA | Control Calidad |
| 7 | Disponible | Bodega/Pañol | Listo para Instalación |
