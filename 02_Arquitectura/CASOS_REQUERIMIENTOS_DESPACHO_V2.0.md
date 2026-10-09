# Casos, Requerimientos y Despacho Physical First — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente

## 1. Propósito

Documentar la relación entre necesidad de negocio, activo físico, OS PMP, referencia externa y futura instalación.

## 2. Entidades conceptuales

### Activo

Identidad física: `tipo_equipo + serie`.

### Caso

Agrupa una necesidad operacional. Puede relacionar intervenciones distintas sin fusionar sus activos.

### OS PMP

Representa una intervención concreta.

### Referencia externa

Identificador de otro sistema, por ejemplo Aranda. Se correlaciona, no reemplaza PMP.

## 3. Caso ARANDA

Entrada:

- referencia;
- activo;
- bus;
- terminal;
- operador;
- falla;
- fecha;
- observación;
- tipo mantenimiento/PoD.

Normalización:

```text
12345678
AR12345678
AR-12345678
→ AR-12345678
```

La referencia externa se mantiene como texto y no se usa para inferir parentesco por coincidencia numérica.

## 4. Caso INTERNO

Cuando el origen no es Aranda, PMP genera `INT-xxxxxx`.

## 5. Alta vs requerimiento

**Gestión de activos** registra el maestro.

**Ingreso de requerimientos** selecciona un activo ya existente.

No existe alta silenciosa dentro de Requerimientos.

## 6. Selección de activo

La búsqueda retorna activos operacionales por:

- tipo;
- serie;
- bus.

Presenta:

- serie;
- modelo;
- marca;
- bus;
- terminal;
- operador.

Cambiar filtros/contexto invalida una selección anterior cuando ya no coincide.

## 7. Validación de contexto

Backend verifica:

- activo existe;
- está en operación;
- corresponde al bus;
- terminal coincide;
- PST/operador coincide;
- referencia no está duplicada;
- no existe intervención activa incompatible.

## 8. Creación de caso + mantenimiento

Dentro de transacción:

1. lock por activo;
2. crear caso;
3. crear MV/MC/PDV/PDC;
4. correlacionar referencia;
5. registrar REQUERIMIENTO_INGRESADO;
6. commit.

Un fallo revierte todas las inserciones.

## 9. Retiro y mantenimiento

La OS de mantenimiento pertenece siempre al activo que originó la falla.

Su serie no cambia aunque luego se instale un reemplazo.

## 10. Stock de reemplazo

Puede provenir de:

### Stock inicial

Activo registrado y recibido inicialmente sin OS.

### Stock reparado

Activo reparado, aprobado QA y recibido en Bodega.

## 11. Despacho de instalación

Secuencia:

```text
contexto destino/técnico
→ activo elegible
→ captura física
→ validar
→ confirmar
→ crear IN
→ registrar SALIDA_BODEGA_TERRENO
```

La validación no crea IN.

## 12. Tipos de captura

### SCANNER

Evidencia física aceptada según reglas del scanner.

### MANUAL

Puede resolver/consultar identidad, pero no necesariamente habilita movimiento.

### MANUAL_AUTORIZADO

Contingencia explícita con:

- presencia física confirmada;
- motivo;
- usuario;
- propósito;
- contexto;
- activo.

No debe describirse como scanner.

## 13. Creación atómica de IN

La transacción:

- valida stock;
- valida técnico;
- valida bus/terminal/PST;
- valida evidencia;
- bloquea origen;
- inserta IN;
- relaciona caso/os_origen/stock;
- registra evento salida.

## 14. Relaciones

### Nueva instalación independiente

Puede no tener caso ni OS origen. Usa stock inicial.

### Reemplazo

Puede incluir:

- `caso_id`;
- `os_origen`;
- `stock_origen_evento` o `stock_origen_os`.

## 15. Reintentos

Se conserva fingerprint/contexto.

- mismo contexto → idempotencia;
- contexto distinto → `DISPATCH_RETRY_CONFLICT`.

## 16. Historial

Buscar serie muestra historia de ese activo, aunque el caso tenga otro equipo.

Buscar caso/referencia permite navegar intervenciones relacionadas sin mezclar historias.

## 17. Ejemplo conceptual

```text
Caso INT-000001
  ├─ MV-000210 → Validador A (falla/reparación)
  └─ IN-xxxxxx → Validador B (reemplazo)
```

A y B mantienen timelines independientes.

## 18. Casos negativos

- serie no registrada;
- activo no operativo;
- bus incorrecto;
- terminal/PST incompatible;
- referencia duplicada;
- OS activa ya existente;
- stock no elegible;
- evidencia de otra serie;
- evidencia vieja;
- stock ya consumido;
- reintento con otro contexto.

## 19. Evidencia

- `08_Pruebas/FLUJOS_OPERACIONALES_V2.0.md`
- `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`
