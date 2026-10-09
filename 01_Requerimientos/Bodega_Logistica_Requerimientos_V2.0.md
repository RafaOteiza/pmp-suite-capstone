# Bodega y Logística — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente

## 1. Responsabilidad

Logística es propietaria de:

- custodia Bodega;
- recepción física;
- despacho físico;
- inventario;
- stock de repuestos;
- entrega de repuestos;
- asignación de retiros;
- alta/recepción inicial de activos;
- ingreso de requerimientos;
- preparación/despacho de instalaciones.

Admin/Gerente pueden consultar proyecciones, pero no ejecutar movimientos.

## 2. Modelo de custodia

```text
validar identidad/contexto
→ evidencia válida
→ confirmar movimiento
→ evento de salida/recepción
→ nueva custodia
```

Un equipo EN TRÁNSITO no pertenece todavía al destino.

## 3. Recepción inicial

### Precondiciones

- activo registrado;
- sin OS/circuito previo;
- identidad válida.

### Captura

- SCANNER;
- MANUAL_AUTORIZADO por Logística con presencia física confirmada.

### Resultado

- RECEPCION_INICIAL;
- HABILITADO_INSTALACION;
- stock inicial elegible;
- sin OS.

## 4. Retiro desde Terreno

Logística:

1. consulta pendientes;
2. asigna Técnico Terreno;
3. después del retiro, ve equipo en tránsito;
4. valida recepción en Bodega;
5. confirma recepción.

La confirmación de retiro de Terreno no equivale a recepción Bodega.

## 5. Despacho a Laboratorio

1. seleccionar OS elegible;
2. capturar/validar activo;
3. revalidar estado;
4. confirmar salida;
5. registrar SALIDA_BODEGA_LABORATORIO;
6. limpiar responsabilidad técnica anterior cuando corresponda;
7. marcar tránsito Lab.

## 6. Retorno desde Laboratorio

Solo después de la salida Lab confirmada, Bodega puede recepcionar.

La recepción:

- usa evidencia Bodega propia;
- no reutiliza la evidencia de salida Lab;
- deja al equipo bajo custodia Bodega;
- habilita la siguiente decisión logística.

## 7. Despacho a QA

Precondiciones:

- reparación técnica finalizada;
- equipo recibido en Bodega;
- sin incompatibilidades de flujo.

Secuencia:

```text
validar salida Bodega→QA
→ confirmar
→ tránsito QA
→ QA recibe por separado
```

## 8. Retorno desde QA

### Operativo

QA sale → Bodega recibe → equipo puede ser elegible para instalación.

### Rechazado

QA sale → Bodega recibe → Bodega vuelve a despachar a Lab → nuevo ciclo físico/técnico.

## 9. Inventario de equipos

La proyección debe distinguir:

- parque global;
- stock físico Bodega;
- disponible;
- no disponible;
- tránsito;
- en operación;
- Laboratorio;
- QA;
- asignado sin despacho;
- en ruta Terreno.

La existencia de una OS no crea un activo adicional.

## 10. Stock inicial vs reparado

### Inicial

Origen = `stock_origen_evento` (HABILITADO_INSTALACION).

### Reparado

Origen = `stock_origen_os` después de reparación + QA + recepción Bodega.

Ambos llegan a “Disponible para instalación”, pero conservan distinta procedencia.

## 11. Despacho de instalación

### Contexto

- caso/reemplazo o nueva instalación;
- bus;
- terminal;
- operador;
- técnico Terreno;
- tipo de equipo.

### Captura

- SCANNER;
- MANUAL consulta (no habilita);
- MANUAL_AUTORIZADO con motivo.

### Confirmación

Crea de forma atómica:

- OS IN;
- relación con stock origen;
- técnico/destino;
- SALIDA_BODEGA_TERRENO;
- correlación externa cuando aplica.

## 12. Repuestos

### Consulta

Bodega visualiza:

- ID/nombre;
- categoría;
- stock;
- stock crítico;
- solicitudes.

### Entrega

1. bloquear OS;
2. bloquear solicitud;
3. bloquear repuesto;
4. validar categoría;
5. validar cantidad;
6. validar stock;
7. descontar;
8. marcar DESPACHADA;
9. registrar LOGISTICA_ENTREGA_REPUESTO;
10. liberar OS de espera si no quedan pendientes.

### Prohibido

Sobrescribir `stock` directamente sin política de ajuste; endpoint responde conflicto.

## 13. Requerimientos

Logística crea casos desde:

- ARANDA;
- INTERNO.

Debe seleccionar activo ya existente/en operación.

## 14. Requisitos funcionales

- **RF-BOD-001:** listar cola operacional.
- **RF-BOD-002:** badge coherente con cola.
- **RF-BOD-003:** recibir desde Terreno con evidencia propia.
- **RF-BOD-004:** recibir desde Lab con evidencia propia.
- **RF-BOD-005:** recibir desde QA con evidencia propia.
- **RF-BOD-006:** despachar Lab con validación+confirmación.
- **RF-BOD-007:** despachar QA con validación+confirmación.
- **RF-BOD-008:** despachar Terreno con validación+confirmación.
- **RF-BOD-009:** crear IN solo al confirmar Terreno.
- **RF-BOD-010:** impedir doble consumo de stock.
- **RF-BOD-011:** inventario asset-centric.
- **RF-BOD-012:** distinguir disponibilidad física.
- **RF-BOD-013:** asignar retiro.
- **RF-BOD-014:** registrar/recibir activo inicial.
- **RF-BOD-015:** crear requerimiento.
- **RF-BOD-016:** gestionar repuestos.
- **RF-BOD-017:** entregar repuesto transaccionalmente.
- **RF-BOD-018:** impedir ajustes directos no autorizados.
- **RF-BOD-019:** mantener coherencia PPU/terminal/PST.
- **RF-BOD-020:** no presentar error como inventario vacío.
- **RF-BOD-021:** permitir filtros/paginación.
- **RF-BOD-022:** conservar historial del activo después de cada movimiento.

## 15. Casos negativos

- sin evidencia → 409;
- evidencia de otra estación → rechazo;
- evidencia vieja → rechazo;
- técnico/destino cambió tras validar → repetir captura;
- stock consumido → rechazo;
- activo en otra intervención → no elegible;
- stock insuficiente → no entregar;
- Admin intenta movimiento → 403;
- serie/tipo no coinciden → rechazo.

## 16. Endpoints

Principalmente `/api/bodega/*`, `/api/activos/*`, `/api/requerimientos/*` y asignación de retiros en `/api/os/*`.

## 17. Evidencia

- `08_Pruebas/FLUJOS_OPERACIONALES_V2.0.md`
- `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`
