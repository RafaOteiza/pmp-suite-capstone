# Flujos Operacionales — PMP Suite V2.0

**Versión:** V2.0

## 1. Principio transversal

**Physical First**:

```text
contexto
→ captura
→ validación
→ confirmación
→ movimiento/evento
```

Nunca:

```text
seleccionar/consultar
→ asumir movimiento
```

## 2. Identidad

- Validador 72 → CVB35/Mikroelektronika.
- Validador 74/75 → CVB45/Mikroelektronika.
- Consola → N9715/Waysion.
- clave conceptual: tipo+serie.

## 3. Alta inicial

```text
ALTA_ACTIVO
→ validación Bodega
→ RECEPCION_INICIAL
→ HABILITADO_INSTALACION
→ disponible
```

Sin OS.

## 4. Requerimiento/falla

```text
activo en operación
→ caso
→ MV/MC/PDV/PDC
→ pendiente retiro
```

## 5. Retiro

```text
Logística asigna
→ Técnico valida
→ Técnico confirma
→ tránsito Bodega
```

## 6. Bodega

```text
validar recepción
→ confirmar
→ custodia Bodega
```

Desde ahí decide Lab/QA/instalación según elegibilidad.

## 7. Laboratorio

```text
salida Bodega
→ En camino
→ recepción Jefe Lab
→ SLA
→ asignación
→ diagnóstico
→ reparación
→ pruebas
→ cierre técnico
→ salida Jefe Lab
```

### Repuesto

```text
PoD
→ solicitud descriptiva
→ espera
→ Bodega entrega
→ stock--
→ reparación
```

## 8. QA

```text
Bodega sale
→ QA recibe
→ Ambiente
→ Pruebas
→ Dictamen
→ QA sale
→ Bodega recibe
```

### Rechazo

Bodega vuelve a enviar a Lab; nuevo ciclo.

## 9. Instalación

```text
stock elegible
→ destino/técnico
→ captura
→ validar
→ confirmar
→ IN + salida
→ Técnico instala
```

## 10. Evidencia por ciclo

### Lab

Última salida Bodega→Lab define ciclo.

### QA

Última salida Bodega→QA define ciclo.

La evidencia debe ser posterior al inicio del ciclo y coincidir con OS/activo/estación.

## 11. Idempotencia

Confirmación repetida idéntica puede reconocer duplicado.

Cambiar:

- activo;
- técnico;
- bus;
- terminal;
- operador;
- stock origen

después de validar requiere nueva evidencia/rechaza reintento.

## 12. Estados derivados

Consultar `02_Arquitectura/MODELO_ESTADOS_EVENTOS_V2.0.md`.

## 13. Casos de error

- sin lectura;
- scanner inválido;
- manual no autorizado;
- serie incorrecta;
- estación incorrecta;
- evidencia vencida;
- actor incorrecto;
- transición fuera de orden;
- stock ya consumido;
- repuesto pendiente;
- prueba rechazada;
- reingreso usando evidencia antigua.

## 14. E2E

Las verificaciones actuales cubren escenarios de:

- activos;
- requerimientos;
- escaneo;
- inventario;
- Lab;
- QA;
- Terreno/Bodega;
- instalación inicial;
- roles.

## 15. Recorrido manual actual

Llegó hasta salida Lab→Bodega. Las etapas posteriores continúan pendientes manualmente, aunque están cubiertas por código/pruebas aisladas según la evidencia consolidada.
