# 6. Flujos de datos clave

## Autenticación

```text
Login Firebase
→ token
→ API verifica token
→ resolve usuario pmp.usuarios
→ estado activo + rol
→ autorización de acción
→ validación del recurso
```

## Falla y retiro

```text
Activo instalado
→ reportar falla
→ crear caso/OS
→ técnico confirma retiro físico
→ En tránsito hacia Bodega
→ Bodega valida y confirma recepción
```

## Laboratorio

```text
Bodega confirma salida a Lab
→ En camino
→ Lab valida lectura propia
→ Jefe confirma recepción
→ SLA inicia
→ Jefe asigna técnico
→ técnico diagnostica/repara/prueba
→ finaliza trabajo
→ Jefe valida salida
→ tránsito a Bodega
```

## QA

```text
Bodega despacha a QA
→ QA recibe
→ Ambiente
→ Pruebas
→ Dictamen
→ QA valida salida
→ Bodega recibe
```

## Instalación

```text
Activo elegible en Bodega
→ contexto instalación
→ lectura física
→ validar
→ confirmar despacho
→ crear IN
→ Terreno instala
→ En operación
```

## Bridge

```text
referencia externa + OS PMP existente + activo
→ correlación
→ búsqueda/historial
```

Bridge no crea OS, no asigna y no mueve stock.
