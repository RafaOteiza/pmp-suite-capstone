# Manual global de funcionamiento PMP Suite

> **FLUJO RETIRADO / HISTÓRICO.** Se conserva esta versión como evidencia académica. El flujo que comienza preparando/asignando una intervención Bridge ya no está vigente. Bridge solo correlaciona referencias con OS existentes. El flujo actual y su guión se describen en la [adenda de casos, ingreso y despacho](../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md) y en [Bridge de correlación](../08_Pruebas/BRIDGE_CORRELACION_Y_HISTORIAL.md).

## Objetivo

PMP Suite controla el ciclo de validadores y consolas desde su retiro en terreno
hasta la reparación, certificación y reinstalación. Este manual resume la línea
base utilizada para la validación Capstone.

## Roles

- `admin`: administra usuarios, asigna carga y controla la recepción y despacho
  físico del laboratorio.
- `gerente`: consulta global en modo de solo lectura.
- `logistica`: opera bodega, inventario, repuestos, recepciones y despachos.
- `tecnico_laboratorio`: diagnostica y repara órdenes asignadas.
- `qa`: prueba y certifica equipos asignados.
- `tecnico_terreno`: ejecuta retiros, sustituciones e instalaciones.

PostgreSQL determina el rol efectivo. Firebase se utiliza para autenticar la
identidad.

## Flujo del equipo

1. Se prepara y asigna una intervención Bridge.
2. Terreno registra el equipo retirado y el reemplazo instalado.
3. El equipo retirado genera una orden y viaja a bodega.
4. Bodega escanea y confirma la recepción.
5. El administrador asigna laboratorio y logística despacha el equipo.
6. El administrador escanea y recibe el activo en laboratorio.
7. El técnico asignado diagnostica, repara y prueba.
8. El administrador despacha el equipo reparado a bodega.
9. Bodega recibe, asigna QA y despacha a certificación.
10. QA escanea, prueba y aprueba o rechaza.
11. Si aprueba, bodega recibe el activo y lo deja disponible.
12. Logística asigna una instalación y terreno confirma el retorno al bus.

Si QA rechaza, registra una observación y el equipo vuelve al circuito de
laboratorio mediante bodega.

## Identificación física

Las estaciones aceptan pistola USB, lector 2D o ingreso manual. Los validadores
se identifican por serie o AMID; las consolas, por serie. El sistema resuelve el
identificador, comprueba la orden activa y registra estación, usuario, resultado
y fecha.

## Laboratorio

El administrador es la jefatura operacional del laboratorio. Recibe, asigna y
despacha. El técnico de laboratorio trabaja únicamente las órdenes que tenga
asignadas y registra el detalle técnico de la reparación.

## Bodega

Logística centraliza los movimientos físicos, el inventario y los repuestos. Un
equipo no debe avanzar a otra estación si no se ha confirmado su recepción o si
el estado no permite el despacho solicitado.

## QA

QA trabaja sobre su carga asignada. La aprobación devuelve el equipo a bodega;
la disponibilidad se confirma después de la recepción logística. El rechazo
mantiene el historial y abre un nuevo ciclo de corrección.

## Inteligencia operacional

El backend ejecuta `06_ModelosIA/src/analyzer.py` con el entorno `.venv`. El
analizador consulta PostgreSQL y entrega un reporte JSON a admin y gerente. No
modifica estados, inventario ni usuarios.

## Ejecución

```powershell
# Backend
cd C:\Users\raote\Documents\Duoc\Tesis\03_Backend\pmp-api
npm run dev

# Frontend
cd C:\Users\raote\Documents\Duoc\Tesis\04_Frontend
npm run dev

# Aplicación móvil
cd C:\Users\raote\Documents\Duoc\Tesis\07_Mobile
npm start
```

La API utiliza el puerto 4000 y el frontend el 5173. Un dispositivo móvil debe
usar la IP local del equipo que ejecuta la API. La dirección se configura en
`07_Mobile/.env` mediante `EXPO_PUBLIC_API_URL`; puede copiarse como base el
archivo `.env.example`.

## Validación vigente

El 12 de septiembre de 2026 se reprodujeron 52 pruebas del backend y 42 del
frontend sin fallos. El build web finalizó correctamente y el entorno Python
importó `psycopg2` 2.9.11.

Los recorridos completos y las pruebas de carga deben documentar datos, entorno,
resultado esperado, resultado obtenido y evidencia asociada.
