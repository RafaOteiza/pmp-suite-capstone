# Control de Calidad (QA) — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente

## 1. Objetivo

Controlar el ciclo físico y técnico de certificación posterior a Laboratorio sin mezclar:

- recepción;
- toma/inicio del trabajo;
- Instalación Ambiente;
- pruebas;
- dictamen;
- salida física.

## 2. Responsabilidad

### QA puede

- consultar su dashboard/cola;
- recibir físicamente;
- iniciar/tomar su trabajo;
- registrar Ambiente;
- registrar pruebas;
- guardar avance;
- emitir dictamen;
- validar/confirmar salida.

### Admin/Gerente

Solo consulta autorizada.

### Logística

Despacha a QA y recibe posteriormente, pero no ejecuta trabajo QA.

## 3. Entrada a QA

Precondiciones:

- trabajo Lab finalizado;
- salida Lab confirmada;
- recepción Bodega confirmada;
- salida Bodega→QA confirmada.

Un registro en estado QA sin evidencia/ciclo actual no debe considerarse automáticamente recibido.

## 4. Recepción

```text
tránsito QA
→ capturar identidad en QA
→ validar
→ confirmar recepción
→ habilitar trabajo QA
```

La evidencia de Bodega no se reutiliza.

## 5. Autonomía

El flujo de asignación administrativa fue retirado.

QA toma/inicia trabajo desde su propia bandeja.

Endpoints legacy de asignar/iniciar/procesar genérico retornan `410`.

## 6. Instalación Ambiente

Es una etapa real del proceso.

PMP Suite registra:

- estado;
- inicio/fin;
- observación;
- responsable;
- ciclo.

**No se documenta ni inventa el procedimiento técnico específico de firmware/configuración/banco si no está formalmente definido.**

## 7. Pruebas QA

El trabajo QA mantiene una colección de pruebas y observaciones dentro del snapshot del ciclo.

Debe:

- corresponder al activo/OS actual;
- conservar revisión;
- evitar duplicados por reintentos;
- soportar borrador/recuperación cuando la UX lo permita.

## 8. Dictamen

Resultados:

- OPERATIVO;
- RECHAZADO.

### OPERATIVO

Indica que QA considera el equipo apto, pero **no cambia custodia**.

### RECHAZADO

Requiere motivo/contexto suficiente y deja antecedentes para el próximo ciclo Lab.

## 9. Salida QA

```text
dictamen
→ nueva evidencia de salida
→ confirmar
→ tránsito Bodega
→ Bodega recibe por separado
```

## 10. Retorno

### Operativo

Después de recepción Bodega puede ingresar a stock reparado elegible.

### Rechazado

Después de recepción Bodega debe volver a Lab mediante nuevo despacho/recepción.

## 11. Ciclos

Cada envío Bodega→QA define un ciclo.

El snapshot/evento incluye `ciclo_qa`.

La V2.0 no hereda:

- recepción;
- pruebas;
- dictamen;
- salida

de un ciclo anterior como evidencia válida del nuevo.

## 12. Requisitos funcionales

- **RF-QA-001:** dashboard por etapa.
- **RF-QA-002:** cola/incoming.
- **RF-QA-003:** recepción Physical First.
- **RF-QA-004:** bloquear identidad incorrecta.
- **RF-QA-005:** iniciar trabajo de forma autónoma.
- **RF-QA-006:** registrar responsable.
- **RF-QA-007:** Ambiente.
- **RF-QA-008:** pruebas.
- **RF-QA-009:** observaciones.
- **RF-QA-010:** revisión/borrador.
- **RF-QA-011:** dictamen Operativo.
- **RF-QA-012:** dictamen Rechazado.
- **RF-QA-013:** rechazo requiere motivo.
- **RF-QA-014:** dictamen no mueve custodia.
- **RF-QA-015:** salida con evidencia independiente.
- **RF-QA-016:** Bodega recibe después.
- **RF-QA-017:** operativo puede habilitar stock después de Bodega.
- **RF-QA-018:** rechazo retorna con antecedentes.
- **RF-QA-019:** nuevo ciclo no reutiliza evidencia.
- **RF-QA-020:** Admin/Gerente no ejecutan QA.
- **RF-QA-021:** rutas legacy responden 410.

## 13. Casos negativos

| Caso | Resultado |
|---|---|
| Admin intenta dictaminar | 403 |
| Logística intenta prueba | 403 |
| QA recibe antes del despacho | conflicto |
| serie incorrecta | bloqueada |
| evidencia vieja | bloqueada |
| rechazo sin motivo | 422/409 |
| dictamen se intenta usar como salida | no cambia custodia |
| endpoint assign/start legacy | 410 |
| reintento incompatible | conflicto |

## 14. Endpoints

- `GET /api/qa/dashboard`
- `GET /api/qa/queue`
- `GET /api/qa/incoming`
- `GET /api/qa/:code/work`
- `POST /api/qa/:code/:purpose/validar`
- `POST /api/qa/:code/actions/:action`

## 15. Trazabilidad

Los hitos QA se almacenan en `flujo_eventos` con metadatos versionados/ciclo. `qa_inspecciones` se conserva como compatibilidad histórica.

## 16. Evidencia

- `08_Pruebas/FLUJOS_OPERACIONALES_V2.0.md`
- `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`
