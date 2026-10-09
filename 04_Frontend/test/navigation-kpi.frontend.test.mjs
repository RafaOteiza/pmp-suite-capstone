import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {MemoryRouter, useNavigate} from 'react-router-dom';
import ts from 'typescript';

const url = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
async function compile(path, modules = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, {compilerOptions:{jsx:ts.JsxEmit.ReactJSX, module:ts.ModuleKind.ESNext, target:ts.ScriptTarget.ES2022}}).outputText;
  return url(js.replace(/from (["'])([^"']+)\1/g, (_, quote, name) => `from ${JSON.stringify(modules[name] || import.meta.resolve(name))}`));
}
const rbac = await compile('../src/app/rbac.ts');
const navigation = await compile('../src/app/navigation.ts', {'./rbac':rbac});
const {getNavigationForUser} = await import(navigation);
const {ROLES} = await import(rbac);
const badges = url('export const getBadgeCounts=async()=>({lab:0,lab_dispatch:0,bodega:0,qa:0});');
const {default:Sidebar} = await import(await compile('../src/components/Sidebar.tsx', {'../app/navigation':navigation,'../app/rbac':rbac,'../api/badges':badges}));
globalThis.window = {addEventListener(){},removeEventListener(){},setInterval,clearInterval};

async function mountSidebar(role, path) {
  let navigate, render;
  function Harness() {
    navigate = useNavigate();
    return React.createElement(Sidebar, {me:{rol:role},collapsed:false,mobileOpen:false,onNavigate(){},onToggleCollapse(){}});
  }
  await act(async () => {render=TestRenderer.create(React.createElement(MemoryRouter,{initialEntries:[path],future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(Harness)));});
  return {render, go:async path=>act(async()=>navigate(path))};
}
function assertActive(render, expected) {
  const links=render.root.findAllByType('a');
  const active=links.filter(link=>link.props.className?.split(/\s+/).includes('active'));
  const current=links.filter(link=>link.props['aria-current']==='page');
  assert.deepEqual(active.map(link=>link.props.href),expected?[expected]:[]);
  assert.deepEqual(current.map(link=>link.props.href),expected?[expected]:[]);
}

test('Sidebar real: Dashboard, Inventario y Recepciones conservan un único activo y aria-current',async()=>{
  const {render,go}=await mountSidebar('logistica','/bodega/dashboard');
  try {
    for(const path of ['/bodega/dashboard','/bodega/modulos','/bodega','/bodega/dashboard']){await go(path);assertActive(render,path);}
    await go('/bodega/modulos/?pagina=2');assertActive(render,'/bodega/modulos');
    await go('/bodega/recepciones/IN-FIXTURE');assertActive(render,'/bodega');
    await go('/bodega/envios-laboratorio/MV-FIXTURE');assertActive(render,'/bodega');
    await go('/bodega/envios-qa/MV-FIXTURE');assertActive(render,'/bodega');
    await go('/bodega/despacho');assertActive(render,'/bodega');
    await go('/bodega-inexistente');assertActive(render,undefined);
  } finally {await act(async()=>render.unmount());}
});

for(const role of Object.values(ROLES))test(`Sidebar real: rutas y subrutas únicas para ${role}`,async()=>{
  const {render,go}=await mountSidebar(role,'/');
  try {
    for(const item of getNavigationForUser({rol:role}).flatMap(section=>section.items)) {
      await go(item.route);assertActive(render,item.route);
      if(item.route!=='/') {await go(item.route+'/detalle');assertActive(render,item.route);}
    }
    await go('/settings');assertActive(render,role==='admin'?'/settings':undefined);
    if(role==='qa') {await go('/qa/MV-FIXTURE/pruebas');assertActive(render,'/qa');await go('/mi-jornada');assertActive(render,'/qa');}
    if(role==='tecnico_laboratorio') {await go('/mi-carga/MV-FIXTURE');assertActive(render,'/mi-jornada');}
    if(role==='jefe_laboratorio') {
      await go('/lab/custodia/MV-FIXTURE/recepcion');assertActive(render,'/lab/recepcion');
      await go('/lab/custodia/MV-FIXTURE/salida');assertActive(render,'/lab/despacho-qa');
    }
  } finally {await act(async()=>render.unmount());}
});

