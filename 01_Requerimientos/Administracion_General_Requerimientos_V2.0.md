# Administración y Supervisión General — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente

## 1. Separación conceptual

PMP Suite diferencia:

- **administrar el sistema**;
- **supervisar la operación**;
- **ejecutar la operación**.

La pertenencia a Admin no convierte al usuario en Logística, QA, Jefe Lab o Técnico.

## 2. Admin

### Puede

- consultar Supervisión global;
- consultar OS;
- consultar parque/equipos;
- consultar trazabilidad;
- consultar Laboratorio/Bodega/QA mediante proyecciones autorizadas;
- consultar IA;
- listar/crear/editar usuarios;
- gestionar recuperación/contraseña administrativa autorizada;
- usar seguridad personal.

### No puede por defecto

- recibir/despachar físicamente en Bodega;
- confirmar recepción/salida Lab;
- asignar carga Lab;
- reparar;
- ejecutar QA;
- asignar retiro Terreno;
- consumir stock.

## 3. Gerente

### Puede

- Dashboard ejecutivo;
- OS;
- parque;
- Bodega/Lab/QA de consulta;
- trazabilidad;
- reportes;
- IA.

### No puede

- administrar usuarios;
- crear requerimientos;
- mover equipos;
- modificar stock;
- reparar;
- dictaminar QA;
- asignar técnicos.

## 4. Jefe Laboratorio

### Puede

- Resumen Lab;
- Recepción;
- Incidencias/Historial;
- Asignar/Reasignar;
- consultar Validadores/Consolas;
- supervisar SLA/carga;
- validar y confirmar salida Lab;
- reportes Lab;
- trazabilidad técnica permitida.

### No puede

- gestionar usuarios;
- operar Bodega;
- ejecutar QA;
- trabajar como Técnico Lab salvo tener dicho rol (modelo de rol único actual);
- asignar Terreno;
- modificar stock.

## 5. Supervisión global

Indicadores deben representar **activos únicos** y diferenciar OS del parque.

Dominios:

- parque;
- operación;
- Bodega;
- Laboratorio;
- QA;
- tránsito;
- disponibilidad;
- órdenes;
- casos;
- fallas/reincidencia.

## 6. Requisitos

- **RF-ADM-001:** Dashboard ejecutivo solo Admin/Gerente.
- **RF-ADM-002:** navegación adaptada a rol.
- **RF-ADM-003:** URL directa aplica la misma capacidad.
- **RF-ADM-004:** Backend aplica autorización final.
- **RF-ADM-005:** Admin administra usuarios.
- **RF-ADM-006:** Gerente es read-only.
- **RF-ADM-007:** Jefe Lab restringido a Lab.
- **RF-ADM-008:** supervisión Lab para Admin/Gerente no concede custodia.
- **RF-ADM-009:** supervisión Bodega no concede movimiento.
- **RF-ADM-010:** supervisión QA no concede trabajo.
- **RF-ADM-011:** KPI parque no duplica un activo por tener varias OS.
- **RF-ADM-012:** error de API tiene estado visual propio.
- **RF-ADM-013:** IA no ejecuta acciones.
- **RF-ADM-014:** búsqueda global respeta rol.
- **RF-ADM-015:** configuración personal no se describe como motor global de configuración.

## 7. Navegación Web

### Admin

- Supervisión global.
- OS.
- Equipos.
- Trazabilidad.
- Bridge.
- Reportes.
- supervisión Lab/Bodega/QA.
- Usuarios.
- Seguridad/Configuración personal.
- IA.

### Gerente

Similar a supervisión, sin Usuarios ni escrituras.

### Jefe Lab

- Gestión de Laboratorio.
- Recepción.
- Asignación.
- Validadores/Consolas.
- Despacho.
- Reportes.
- antecedentes técnicos.

## 8. Criterios de aceptación

1. Admin POST operacional prohibido devuelve 403.
2. Gerente no puede mutar recursos.
3. Jefe Lab no puede llamar Bodega/QA.
4. El Sidebar no muestra acciones no autorizadas.
5. Acceder manualmente por URL no salta ProtectedRoute/API.
6. Dashboard distingue error/vacío/cero.

## 9. Evidencia

- `08_Pruebas/RBAC_SEGURIDAD_V2.0.md`
- `08_Pruebas/UX_EXPERIENCIA_V2.0.md`
- `Documentacion Capstone/07_REPORTES_KPI_V2.0.md`
