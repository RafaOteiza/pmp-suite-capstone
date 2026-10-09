// Static file render: no application server, no parallel environment, no database.
// Real pages/components; in-memory read fixtures only. All commands are forbidden.
// These fixtures never contact Firebase, PostgreSQL or the habitual API.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {createServer as createProbe} from 'node:net';
import {inventoryFixture,initialAsset,stageLabels} from './logistics-fixture.mjs';
const phase=process.env.PMP_UX_PHASE||'after';
const out=resolve(process.env.PMP_UX_OUTPUT||'../.local/pmp-verification/ux-suite-2026-10-08',phase);
const baseline=resolve('../.local/pmp-verification/ux-suite-2026-10-08/before-source');await mkdir(out,{recursive:true});
const pages=(await readdir('src/pages')).filter(x=>x.endsWith('.tsx')).map(x=>x.slice(0,-4));
const mock=`
const initialAsset=${JSON.stringify(initialAsset)},stageLabels=${JSON.stringify(stageLabels)};
const inventoryFixture=${inventoryFixture.toString()};
import {useLocation} from 'react-router-dom';
export const fbAuth={currentUser:null};
export const useSession=()=>{const l=useLocation();const role=new URLSearchParams(l.search).get('role')||'admin';return {status:l.pathname.includes('LoginPage')?'unauthenticated':'authenticated',me:{id:'fixture',nombre:'Persona de prueba',apellido:'Apellido extenso de prueba',rol:role},refreshSession:async()=>null,endSession(){}};};
const ticket={codigo_os:'MV-TEST',tipo_equipo:'VALIDADOR',serie:'7409101',modelo:'CVB45',marca:'Mikroelektronika',bus_ppu:'TEST01',terminal:'Terminal de prueba',operador:'Operador de prueba',referencia_ar:'AR-TEST',falla:'Lectura QR intermitente',estado_id:4,estado_nombre:'EN_DIAGNOSTICO',fecha:'2026-10-08T12:00:00Z',fecha_ingreso_laboratorio:'2026-10-08T12:00:00Z',fuente_ingreso_laboratorio:'RECEPCION_FISICA',ubicacion:'Laboratorio Garantías',tecnico_laboratorio_id:'fixture',tecnico_laboratorio:'Persona de prueba',recepcion_laboratorio_confirmada:true};
const reference={...ticket,id:'reference-fixture',sistema_externo:'ARANDA',referencia_externa:'AR-TEST'};
const actor={id:'fixture',nombre:'Persona de prueba',fecha:ticket.fecha};
const fail=async(path,options={})=>{window.__reads.push(path);
 if(path==='/api/dashboard/badges')return {data:{bodega:0,lab:0,lab_dispatch:0,qa:0}};
 const mode=new URLSearchParams(location.hash.split('?')[1]).get('mode');
 if(mode==='data'){
  if(path==='/api/bridge')return {data:[reference]};
  if(path.endsWith('/historial'))return {data:{...ticket,ordenes:[{...ticket,estado:'EN_DIAGNOSTICO'}],referencias:[reference],eventos:[{id:'event-fixture',codigo_os:ticket.codigo_os,fecha:ticket.fecha,tipo:'RECEPCION_LABORATORIO_CONFIRMADA',descripcion:'Recepcion fisica confirmada',cambios:[],detalle:{metadata:{serie:ticket.serie,tecnico:actor.nombre,ubicacion:'Laboratorio',origen_captura:'SCANNER'}}}]}};
  if(path==='/api/os/pendientes-retiro')return {data:[{...ticket,estado_id:1,estado_operacional:'Pendiente de retiro',estado_actual:'PENDIENTE_RETIRO',tecnico_terreno_id:null},{...ticket,codigo_os:'MC-TEST',tipo_equipo:'CONSOLA',serie:'9100100',estado_id:1,estado_operacional:'Pendiente de retiro',estado_actual:'PENDIENTE_RETIRO',tecnico_terreno_id:'fixture',tecnico_terreno:actor.nombre}]};
  if(path==='/api/bodega/tecnicos')return {data:[{id:'fixture',nombre:'Persona',apellido:'Prueba'}]};
  if(path.startsWith('/api/lab/work/'))return {data:{revision:'1',trabajo:{diagnostico:{resultado:'CONFIRMADA',falla_real:'Falla QR',observacion:'Lectura intermitente'},acciones:['Limpieza interna'],pruebas:[],resultado:'',observaciones_qa:'',pod:{categoria:'',observacion:'',fotografias:[]}}}};
  if(path.startsWith('/api/qa/')&&path.endsWith('/work'))return {data:{...ticket,codigo_os:'MV-TEST',etapa:'PRUEBAS',estado_operacional:'Pruebas',ciclo_qa:'1',revision:'1',trabajo:{etapa:'PRUEBAS',responsable:actor,receptor:actor,ambiente:{estado:'COMPLETADO',inicio:ticket.fecha,fin:ticket.fecha,observacion:'Instalacion de prueba preparada'},pruebas:[{id:'test',metodo:'Manual',resultado:'PENDIENTE',observacion:'Verificar lectura',autor:actor,fecha:ticket.fecha}],dictamen:null},historial:[],antecedentes_laboratorio:null}};
  if(path==='/api/bodega/inventario'){const data=inventoryFixture(Object.entries(stageLabels).map(([etapa,label],i)=>({...initialAsset,serie:String(7409100+i),etapa,estado_actual:label,en_bodega:['BODEGA','DISPONIBLE'].includes(etapa),disponible:etapa==='DISPONIBLE'})),options.params);data.secundarios.alertasStock=${Number(process.env.PMP_UX_STOCK_ALERTS||0)};return {data};}
  if(path==='/api/dashboard/summary')return {data:{kpis:{totalEnProceso:4,consolasEnLab:2,validadoresEnLab:2,totalReparados:3,totalOperativos:42,totalEnRuta:2,totalAsignados:1,totalEnBodega:5,totalEnTransito:3,totalReparadosLab:2,totalEnQa:4,totalPods:2,podsReparados:1,tiempoPromedio:18},charts:{pieData:[{name:'Validadores',value:2},{name:'Consolas',value:2}],barData:[{name:'En operación',cantidad:42},{name:'Disponibles',cantidad:3},{name:'Pendientes',cantidad:5}]}}};
  if(path==='/api/bodega/queue')return {data:[{...ticket,estado_id:2,origen_transito:'terreno'}]};
  if(path.startsWith('/api/lab/queue/'))return {data:[{...ticket,...(location.hash.includes('LabWorkPage')?{estado_id:5,estado_nombre:'EN_REPARACION'}:{}),codigo_os:path.endsWith('CONSOLA')?'MC-TEST':'MV-TEST',tipo_equipo:path.endsWith('CONSOLA')?'CONSOLA':'VALIDADOR'}]};
  if(path==='/api/lab/completed')return {data:[]};
  if(path==='/api/lab/technicians')return {data:[{id:'fixture',nombre:'Persona',apellido:'Prueba'}]};
  if(path==='/api/qa/dashboard')return {data:{items:[{...ticket,etapa:'RECEPCION',estado_operacional:'Pendiente recepción',dictamen:null}],counts:{RECEPCION:1,AMBIENTE:2,PRUEBAS:3,DESPACHO:1},total:1,page:1,page_size:20}};
  if(path==='/api/dashboard/equipos-operativos')return {data:{data:[{...ticket,tipo:'VALIDADOR',ultima_operacion:ticket.fecha}],pagination:{total:1,limit:20,offset:0}}};
  if(path==='/api/users')return {data:{items:[{id:'fixture',nombre:'Persona',apellido:'Prueba',correo:'prueba@example.test',rol:'logistica',activo:true}]}};
 }
 throw {response:{status:503,data:{message:'Consulta no disponible · fixture aislada'}}};};
export const api={get:fail,post:async()=>{window.__writes++;throw Error('NO WRITES IN VISUAL TEST');},put:async()=>{window.__writes++;throw Error('NO WRITES IN VISUAL TEST');},patch:async()=>{window.__writes++;throw Error('NO WRITES IN VISUAL TEST');},delete:async()=>{window.__writes++;throw Error('NO WRITES IN VISUAL TEST');}};export const coreApi=api;`;
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import {RouterProvider,createHashRouter} from 'react-router-dom';import Shell from './src/components/AppLayout';
${pages.map((name,i)=>`import P${i} from './src/pages/${name}';`).join('\n')}
window.__reads=[];window.__renderErrors=[];window.__writes=0;
class Boundary extends React.Component {state={error:null};static getDerivedStateFromError(error){return {error};}componentDidCatch(e){window.__renderErrors.push(e.message);}render(){return this.state.error?<p role="alert">RENDER ERROR: {this.state.error.message}</p>:this.props.children;}}
createRoot(document.getElementById('root')).render(<RouterProvider router={createHashRouter([{element:<Shell/>,children:[${pages.filter(n=>n!=='LoginPage').map((n)=>`{path:'/${n}/:osId?/:step?',element:<Boundary><P${pages.indexOf(n)} purpose="receipt"/></Boundary>}`).join(',')}]},{path:'/LoginPage',element:<P${pages.indexOf('LoginPage')}/>}])}/>);`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),loader:'tsx'},bundle:true,outfile:join(out,'fixture.js'),plugins:[{name:'isolated-transport',setup(b){if(phase==='before')b.onLoad({filter:/[\\/]src[\\/].*\.(ts|tsx)$/},async args=>({contents:await readFile(resolve(baseline,args.path.slice(resolve('src').length+1).replace(/^/, 'src/')),'utf8'),loader:args.path.endsWith('.tsx')?'tsx':'ts',resolveDir:resolve(args.path,'..')}));b.onResolve({filter:/(^|\/)http$|app\/(SessionContext|firebase)$/},()=>({path:'fixture',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:mock,loader:'js',resolveDir:process.cwd()}));}}]});
const css=(await Promise.all(['tokens','base','layout','components','pages','logistics-assets',...(phase==='after'?['product-ui']:[])].map(n=>readFile(resolve(phase==='before'?baseline:'.','src/styles/'+n+'.css'),'utf8')))).join('\n');
let bundle=await readFile(join(out,'fixture.js'),'utf8');bundle=bundle.replaceAll('/brand/',pathToFileURL(resolve('public/brand')).href+'/');await writeFile(join(out,'fixture.js'),bundle);
await writeFile(join(out,'fixture.html'),`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css.replaceAll('/brand/',pathToFileURL(resolve('public/brand')).href+'/')}</style></head><body><div id="root"></div><script src="fixture.js"></script></body></html>`);
const origin=pathToFileURL(join(out,'fixture.html')).href;
const probe=createProbe();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const debugPort=probe.address().port;await new Promise(r=>probe.close(r));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+debugPort,'--user-data-dir='+join(out,'chrome-profile'),'--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws;const report=[],keyboard=[];
try{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();break;}catch{await delay(100);}}assert.ok(tabs);
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const calls=new Map();
 ws.addEventListener('message',e=>{const v=JSON.parse(e.data);if(v.id){const p=calls.get(v.id);calls.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;calls.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const js=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};await call('Page.enable');await call('Network.enable');await call('Network.setBlockedURLs',{urls:['http://*','https://*']});
 const rich=['DashboardPage','BodegaDashboardPage','BodegaModulosPage','BodegaPage','LabDashboardPage','LabAsignacionPage','LabValidadoresPage','LabConsolasPage','QaPage','EquiposOperativosPage','AdminUsersPage','RoleDashboardPage','LabWorkPage','QaWorkPage','TrazabilidadPage','RetirosTerrenoPage','BridgeFlowPage'];
 const cases=[...pages.map(page=>({page,mode:'error'})),...rich.map(page=>({page,mode:'data'}))];
 for(const {page,mode} of cases.filter(c=>!process.env.PMP_UX_PAGES||process.env.PMP_UX_PAGES.split(',').includes(c.page))){
  const role=['IngresoOSPage','MyServiceOrdersPage'].includes(page)?'tecnico_terreno':page==='RoleDashboardPage'?'tecnico_laboratorio':page==='LabWorkPage'?'tecnico_laboratorio':page==='QaWorkPage'?'qa':'admin';
  const suffix=page==='QaWorkPage'&&mode==='data'?'/MV-TEST/pruebas':page==='LabWorkPage'&&mode==='data'?'/MV-TEST':['LabCustodyPage','QaWorkPage'].includes(page)?'/MV-FIXTURE/recepcion':['LabWorkPage','WarehouseOperationPage'].includes(page)?'/MV-FIXTURE':'';
  const extra=page==='TrazabilidadPage'&&mode==='data'?'&tipo=VALIDADOR&serie=7409101':'';
  await call('Page.navigate',{url:`${origin}?page=${page}-${mode}#/${page}${suffix}?role=${role}&mode=${mode}${extra}`});await delay(page==='DashboardPage'?1800:650);
  for(const theme of ['light','dark'])for(const width of (phase==='before'?[1440]:[320,390,768,1024,1440])){
   await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await js(`document.documentElement.setAttribute('data-theme','${theme}')`);await delay(400);
   const metrics=await js(`({overflow:document.documentElement.scrollWidth>innerWidth,errors:window.__renderErrors||[],heading:document.querySelector('main h1,h1')?.textContent,alerts:[...document.querySelectorAll('[role="alert"]')].map(e=>e.textContent),reads:window.__reads.length,writes:window.__writes,sidebar:document.querySelector(".sidebar")?.getBoundingClientRect().width,sidebarFont:getComputedStyle(document.querySelector(".sb-link")||document.body).fontSize,contentMetrics:{button:document.querySelector("main .btn")?.getBoundingClientRect().height,card:document.querySelector("main .stat-card")?.getBoundingClientRect().height,title:document.querySelector("main h1")&&getComputedStyle(document.querySelector("main h1")).fontSize},overlays:document.querySelectorAll('dialog[open],[aria-modal="true"]').length,culprits:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=='absolute').slice(0,5).map(e=>e.tagName+'.'+e.className)})`);
   report.push({page,mode,role,theme,width,...metrics});
   if((mode==='data'||['GestionActivosPage','IngresoRequerimientosPage','TrazabilidadPage','BridgeFlowPage','LoginPage'].includes(page))&&[320,1440].includes(width)){
    const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(join(out,`${page}-${mode}-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
   }
  }
  if(mode==='data'&&page==='BodegaDashboardPage'){
   await js("document.querySelector('main [data-interactive=\"true\"]').focus()");
   await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
   await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
   const focused=await js("({tag:document.activeElement.tagName,role:document.activeElement.getAttribute('role'),visible:document.activeElement.matches(':focus-visible'),outline:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth})");
   keyboard.push({page,...focused});assert.equal(focused.visible,true);assert.notEqual(focused.outline,'none');
  }
 }
 await writeFile(join(out,process.env.PMP_UX_PAGES?'report-targeted.json':'report.json'),JSON.stringify(report,null,2));
 if(keyboard.length)await writeFile(join(out,'keyboard.json'),JSON.stringify(keyboard,null,2));
 const failures=report.filter(r=>r.overflow||r.errors.length||r.overlays||r.writes);console.log(JSON.stringify({pages:pages.length,renders:report.length,failures},null,2));assert.equal(failures.length,0);
}finally{ws?.close();browser.kill();}
