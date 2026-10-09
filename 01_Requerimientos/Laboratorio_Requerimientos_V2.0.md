# Laboratorio — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente

## 1. Objetivo

Controlar de forma separada:

1. custodia;
2. asignación;
3. trabajo técnico;
4. repuestos;
5. SLA;
6. salida;
7. antecedentes QA/reingresos.

## 2. Roles

### Jefe Laboratorio

- Recepción.
- Incidencias.
- Asignar/Reasignar.
- Supervisar.
- Consultar equipos.
- SLA/carga.
- Validar salida.
- Confirmar salida.

### Técnico Laboratorio

- Mi carga.
- Diagnóstico.
- Reparación.
- Guardar avance.
- Pruebas.
- PoD.
- Solicitud descriptiva de repuesto.
- Cierre técnico.

### Admin / Gerente

Consulta autorizada, no custodia ni trabajo.

## 3. Bandeja de recepción

Pestañas:

- **En camino:** salida Bodega→Lab confirmada, sin recepción Lab.
- **Recibidos:** recepción física del ciclo confirmada.
- **Incidencias:** discrepancia/evidencia problemática.
- **Historial:** movimientos ya resueltos.

Campos esperados:

- OS;
- tipo;
- serie;
- modelo/marca;
- falla;
- origen;
- fecha salida;
- fecha recepción;
- técnico;
- estado/SLA.

## 4. Recepción Physical First

```text
Bodega confirma salida
→ En camino
→ Jefe Lab captura en LABORATORIO
→ validar
→ confirmar
→ estado/ubicación Lab
→ SLA
```

La captura de Bodega no reemplaza la lectura Lab.

## 5. SLA

La fecha de SLA es la primera recepción confirmada del **ciclo actual**.

Relecturas no reinician reloj.

Una nueva salida Bodega→Lab define un nuevo ciclo y requiere nueva recepción.

## 6. Asignación

Precondiciones:

- equipo recibido;
- ciclo vigente;
- técnico activo `tecnico_laboratorio`.

Asignar/reasignar:

- actualiza responsable;
- no cambia custodia;
- no cambia identidad;
- no inicia/termina trabajo automáticamente.

## 7. Trabajo técnico

### Estado inicial

OS asignada/recibida entra a diagnóstico.

### Iniciar

Cambia a reparación según flujo vigente.

### Diagnóstico

Opciones:

- CONFIRMADA;
- DIFERENTE;
- NFF;
- POD;
- OTRO.

Reglas:

- CONFIRMADA/DIFERENTE requieren falla real;
- NFF/OTRO requieren observación;
- PoD debe permanecer coherente con resultado final.

### Intervenciones

Lista técnica de acciones realizadas, por ejemplo limpieza, ajuste, cambio de componente, firmware/software, conectores, etc., según el trabajo real informado.

No convertir métodos de prueba en intervenciones.

### Pruebas

Catálogo fijo:

- Manual;
- Test MK.

Cada prueba:

- nombre;
- APROBADA/RECHAZADA;
- observación opcional.

### Resultado

Durante borrador se admiten estados de trabajo; para cierre solo resultado compatible:

- REPARADO;
- NFF;
- POD.

El cierre exige pruebas completas/aprobadas.

## 8. Borradores y concurrencia

El avance se guarda en `LAB_AVANCE_GUARDADO`.

Se utiliza `revision` para impedir que dos ediciones sobrescriban silenciosamente trabajo.

Guardar avance:

- no cambia stock;
- no cambia custodia;
- no cierra OS.

## 9. PoD

PoD puede originarse en:

- Terreno;
- Laboratorio.

Debe conservar:

- categoría;
- observación;
- fotografías permitidas cuando corresponda.

El detalle PoD soporta la solicitud de repuesto.

## 10. Repuesto

El técnico:

- informa necesidad;
- informa motivo.

No informa:

- `repuesto_id`;
- cantidad de inventario;
- stock;
- consumo.

Bodega resuelve el inventario.

La OS puede pasar a espera de repuesto.

No se cierra mientras exista una solicitud no despachada/rechazada.

## 11. Cierre técnico

Genera:

- registro_reparaciones;
- LAB_DIAGNOSTICO_CONFIRMADO;
- POD_DETECTADO_LABORATORIO si aplica;
- LAB_REPARACION_FINALIZADA;
- LAB_LISTO_QA.

**No mueve custodia.**

## 12. Salida Lab

Actor: Jefe Laboratorio.

```text
Listo
→ validar evidencia SALIDA
→ confirmar
→ tránsito Bodega
```

La salida no significa recepción en Bodega.

## 13. Reingreso desde QA

Cuando QA rechaza:

1. QA sale físicamente;
2. Bodega recibe;
3. Bodega vuelve a despachar a Lab;
4. Jefe Lab vuelve a recibir;
5. nuevo ciclo;
6. Técnico visualiza antecedentes del dictamen anterior.

No se reutiliza evidencia/cierre previo.

## 14. Requisitos funcionales

- **RF-LAB-001:** En camino.
- **RF-LAB-002:** Recibidos.
- **RF-LAB-003:** Incidencias.
- **RF-LAB-004:** Historial.
- **RF-LAB-005:** recepción solo Jefe Lab.
- **RF-LAB-006:** SLA desde recepción vigente.
- **RF-LAB-007:** asignar/reasignar.
- **RF-LAB-008:** carga por técnico.
- **RF-LAB-009:** técnico solo carga propia.
- **RF-LAB-010:** diagnóstico estructurado.
- **RF-LAB-011:** intervenciones.
- **RF-LAB-012:** pruebas Manual/Test MK.
- **RF-LAB-013:** borrador con revisión.
- **RF-LAB-014:** PoD.
- **RF-LAB-015:** solicitud descriptiva.
- **RF-LAB-016:** espera repuesto.
- **RF-LAB-017:** cierre técnico validado.
- **RF-LAB-018:** cierre no mueve.
- **RF-LAB-019:** salida Jefe Lab.
- **RF-LAB-020:** reingreso conserva antecedentes.
- **RF-LAB-021:** reportes/SLA.
- **RF-LAB-022:** error no equivale a cero.

## 15. Casos negativos

- tránsito sin recepción intenta asignarse → 409;
- Admin intenta confirmar recepción → 403;
- técnico intenta OS ajena → 403;
- técnico envía repuesto_id/cantidad → rechazo;
- prueba rechazada al cerrar → 422;
- solicitud pendiente al cerrar → 409;
- evidencia de ciclo anterior → rechazo;
- cierre repetido con payload distinto → conflicto.

## 16. Endpoints

- `GET /api/lab/supervision`
- `GET /api/lab/reception`
- `/api/lab/custody/:code/*`
- `PUT /api/lab/assign`
- `GET /api/lab/queue/:type`
- `GET/PUT /api/lab/work/:codigoOs`
- `POST /api/lab/finish`
- `POST /api/lab/request-part`

## 17. Reportes

Ver `Documentacion Capstone/07_REPORTES_KPI_V2.0.md`.
