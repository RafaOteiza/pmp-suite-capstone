import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import React from 'react';
import Renderer,{act} from 'react-test-renderer';
import {MemoryRouter,Routes,Route,Outlet,useLocation} from 'react-router-dom';
import ts from 'typescript';
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64'),cache=new Map();
globalThis.__adminLab={};
const transport=data(`export const api={get:async(path,options)=>{const s=globalThis.__adminLab;s.reads.push({path,params:options?.params});if(s.error)throw Error('Fixture unavailable');return {data:path.includes('/executive')?s.dashboard:path.includes('predictive')?s.risks:s.reception};},post:async()=>{throw Error('Writes forbidden');}};`);
async function compile(path){
 if(cache.has(path))return cache.get(path);
 const source=await readFile(path,'utf8');let js=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 js=js.replace(/import\s+['"][^'"]+\.css['"];?/g,'');
 for(const match of [...js.matchAll(/from (["'])([^"']+)\1/g)]){
  const name=match[2];let module;
  if(name.endsWith('/api/http')||name==='./http')module=transport;
  else if(name.startsWith('.')){let file;for(const ext of ['.tsx','.ts','.js']){try{await readFile(resolve(dirname(path),name+ext));file=resolve(dirname(path),name+ext);break;}catch{}}if(!file)throw Error(name);module=await compile(file);}
  else module=import.meta.resolve(name);
  js=js.replace(match[0],'from '+JSON.stringify(module));
 }
 const result=data(js);cache.set(path,result);return result;
}
const {default:Reception}=await import(await compile(resolve('src/pages/LabReceptionPage.tsx')));
const {default:Dashboard}=await import(await compile(resolve('src/pages/DashboardPage.tsx')));
const {uniqueAssetRisks}=await import(await compile(resolve('src/utils/aiPresentation.ts')));
const {labSLA}=await import(await compile(resolve('src/utils/labWorkload.ts')));
const reception=()=>({updatedAt:new Date().toISOString(),counts:{camino:1,recibidos:0,hoy:0,pendientes:0,incidencias:0,historial:0},total:1,limit:20,offset:0,items:[{codigo_os:'MV-FIXTURE',tipo_equipo:'VALIDADOR',serie:'7490889',modelo:'CVB45',marca:'Mikroelektronika',falla:'Falla QR',bus_ppu:'BJ2149',terminal:'El Conquistador',operador:'VOYSANTIAGO',codigo_caso:'INT-FIXTURE',fecha_salida:new Date().toISOString(),fecha_evento:new Date().toISOString(),en_camino:true,recibido:false}]});
const dashboard=()=>({updatedAt:new Date().toISOString(),assets:{total:1,validadores:1,consolas:0,operacion:0,disponibles:1,bodega:1,laboratorio:0,qa:0,transito:0,noDisponibles:0},distribution:[{etapa:'DISPONIBLE',label:'Bodega · disponibles',validadores:1,consolas:0,total:1}],transit:[],orders:{activas:0,cerradas:0,fallas:0,instalaciones:0,enRuta:0,retiros:0,recepciones:0,despachos:0},podCases:0,stockAlerts:0,qa:{},lab:{camino:0,recibidos:0,pendientes:0,diagnostico:0,reparacion:0,repuestos:0,salida:0,reingresos:0},labWorkload:[],labTechnicians:[]});
async function mount(Page,role='admin',path='/lab/recepcion'){
 globalThis.__adminLab={reads:[],reception:reception(),dashboard:dashboard(),risks:[],...globalThis.__adminLab};
 function Context(){const location=useLocation();globalThis.__adminLab.location=location;return React.createElement(Outlet,{context:{rol:role}});}
 let render;await act(async()=>{render=Renderer.create(React.createElement(MemoryRouter,{initialEntries:[path],future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(Routes,null,React.createElement(Route,{element:React.createElement(Context)},React.createElement(Route,{path:'*',element:React.createElement(Page)})))));});return render;
}
const text=render=>JSON.stringify(render.toJSON());
const content=node=>typeof node==='string'||typeof node==='number'?String(node):(node.children||[]).map(content).join('');
const reset=()=>{globalThis.__adminLab={reads:[],reception:reception(),dashboard:dashboard(),risks:[]};};
test('recepción muestra identidad, salida y acción operacional sin escribir',async()=>{reset();const r=await mount(Reception,'jefe_laboratorio');try{assert.match(text(r),/MV-FIXTURE|Falla QR/);assert.match(text(r),/En tránsito hacia Laboratorio/);assert.ok(r.root.findAllByType('a').some(a=>a.props.href==='/lab/custodia/MV-FIXTURE/recepcion'));assert.ok(globalThis.__adminLab.reads.every(x=>x.path==='/api/lab/reception'));}finally{await act(async()=>r.unmount());}});
test('Gerente supervisa sin preparar recepción ni enlace de asignación',async()=>{reset();const r=await mount(Reception,'gerente');try{assert.doesNotMatch(text(r),/Preparar recepción/);assert.ok(!r.root.findAllByType('a').some(a=>/custodia|asignacion/.test(a.props.href)));}finally{await act(async()=>r.unmount());}});
test('búsqueda, tipo y bandeja se envían al backend y mantienen navegación',async()=>{reset();const r=await mount(Reception);try{
 await act(async()=>r.root.findByType('input').props.onChange({target:{value:'7490889'}}));await act(async()=>r.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(globalThis.__adminLab.reads.at(-1).params.q,'7490889');
 await act(async()=>r.root.findByType('select').props.onChange({target:{value:'CONSOLA'}}));assert.equal(globalThis.__adminLab.reads.at(-1).params.tipo,'CONSOLA');
 const tab=r.root.findAllByType('button').find(b=>b.props['aria-pressed']!==undefined&&content(b).includes('Incidencias'));await act(async()=>tab.props.onClick());assert.equal(globalThis.__adminLab.reads.at(-1).params.tab,'incidencias');
 }finally{await act(async()=>r.unmount());}});
test('error no se presenta como vacío ni muestra contadores anteriores',async()=>{reset();globalThis.__adminLab.error=true;const r=await mount(Reception);try{assert.match(text(r),/Fixture unavailable/);assert.doesNotMatch(text(r),/Sin equipos en camino|MV-FIXTURE/);}finally{await act(async()=>r.unmount());}});
test('empty real usa mensaje útil y cero real',async()=>{reset();globalThis.__adminLab.reception={...reception(),counts:{camino:0,recibidos:0,hoy:0,pendientes:0,incidencias:0,historial:0},total:0,items:[]};const r=await mount(Reception);try{assert.match(text(r),/Sin equipos en camino/);}finally{await act(async()=>r.unmount());}});
test('dashboard no confunde stock inicial con OS; KPI navega con filtros',async()=>{reset();const r=await mount(Dashboard,'admin','/');try{const cards=r.root.findAllByType('article');const orders=cards.find(c=>content(c).includes('OS activas'));assert.equal(orders.find(n=>n.props.className==='stat-value').children.join(''),'0');const available=cards.find(c=>content(c).includes('Disponibles'));await act(async()=>available.props.onClick());assert.equal(globalThis.__adminLab.location.pathname,'/bodega/dashboard');assert.equal(globalThis.__adminLab.location.search,'?consulta=1&etapa=DISPONIBLE');}finally{await act(async()=>r.unmount());}});
test('IA agrupa tipo + serie con máximo reportado, no cruza tipos ni muta predicciones',()=>{const rows=[{tipo_equipo:'VALIDADOR',serie_equipo:'same',riesgo_score:.3},{tipo_equipo:'VALIDADOR',serie_equipo:'same',riesgo_score:0},{tipo_equipo:'CONSOLA',serie_equipo:'same',riesgo_score:.1}];const copy=structuredClone(rows);assert.equal(uniqueAssetRisks(rows).length,2);assert.equal(uniqueAssetRisks(rows)[0].riesgo_score,.3);assert.deepEqual(rows,copy);});
test('SLA respeta recepción, tránsito y fallback legacy sin cambiar umbrales',()=>{const old=new Date(Date.now()-10*86400000).toISOString();assert.equal(labSLA({fecha:old,en_transito_laboratorio:true}).sinSla,true);assert.equal(labSLA({fecha:old,fecha_ingreso_laboratorio:new Date().toISOString()}).vencido,false);assert.equal(labSLA({fecha:old,ingreso_legacy:true}).vencido,true);});
test('recibidos hoy filtra el historial y cambiar bandeja elimina el filtro temporal',async()=>{
 reset();const r=await mount(Reception);try{
  const card=r.root.findAllByType('article').find(c=>content(c).includes('Recibidos hoy'));
  await act(async()=>card.props.onClick());assert.equal(globalThis.__adminLab.reads.at(-1).params.hoy,'1');assert.equal(globalThis.__adminLab.reads.at(-1).params.tab,'historial');
  const tab=r.root.findAllByType('button').find(b=>b.props['aria-pressed']!==undefined&&content(b).includes('En camino'));
  await act(async()=>tab.props.onClick());assert.equal(globalThis.__adminLab.reads.at(-1).params.hoy,'');
 }finally{await act(async()=>r.unmount());}
});
test('consulta del gerente enlaza historial por tipo y serie, conservando identidad',async()=>{
 reset();const r=await mount(Reception,'gerente');try{
  assert.ok(r.root.findAllByType('a').some(a=>a.props.href==='/trazabilidad?tipo=VALIDADOR&serie=7490889'));
 }finally{await act(async()=>r.unmount());}
});
