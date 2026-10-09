// Real web5173 -> API4000 verification, no fixture, no mocked endpoint, no operational write.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {local,pool,sourceUrl,fingerprint,sequences} from './database-tools.mjs';
import {customTokenFor,close} from './habitual-readonly.mjs';
const out=resolve(local,'habitual-web');mkdirSync(out,{recursive:true});
const db=pool(sourceUrl(),true),before=await fingerprint(db),seqBefore=await sequences(db);
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=9351','--user-data-dir='+resolve(out,'profile'),'--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws,call,js,authImport;
const requests=[],responses=[],blocked=[],screens=[];let active=0;
try{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9351/json/list')).json();break;}catch{await delay(100);}}
 assert.ok(tabs);ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0;const calls=new Map();
 ws.addEventListener('message',e=>{const r=JSON.parse(e.data);if(r.id){const c=calls.get(r.id);calls.delete(r.id);r.error?c.reject(r.error):c.resolve(r.result);}else if(r.method==='Fetch.requestPaused'){
  const p=r.params,u=new URL(p.request.url);if(u.port==='4000'&&u.pathname.startsWith('/api/')&&!['GET','OPTIONS'].includes(p.request.method)){blocked.push({path:u.pathname,method:p.request.method});void call('Fetch.failRequest',{requestId:p.requestId,errorReason:'BlockedByClient'});}else void call('Fetch.continueRequest',{requestId:p.requestId});
 }else if(r.method==='Network.requestWillBeSent'&&r.params.request.url.startsWith('http://localhost:4000/api/')){requests.push({url:r.params.request.url,method:r.params.request.method});active++;}
 else if(r.method==='Network.responseReceived'&&r.params.response.url.startsWith('http://localhost:4000/api/')){responses.push({url:r.params.response.url,status:r.params.response.status});active=Math.max(0,active-1);}});
 call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;calls.set(id,{resolve,reject:e=>reject(new Error(method+': '+JSON.stringify(e)))});ws.send(JSON.stringify({id,method,params}));});
 js=async(expression)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,'Browser script failed (details omitted to protect temporary authentication)');return r.result.value;};
 await call('Page.enable');await call('Network.enable');await call('Fetch.enable',{patterns:[{urlPattern:'http://localhost:4000/api/*'}]});
 await call('Page.navigate',{url:'http://localhost:5173/login'});
 for(let i=0;i<100;i++){if(await js("!!document.querySelector('input[type=password]')"))break;await delay(100);}
 const module=await(await fetch('http://localhost:5173/src/app/firebase.ts')).text();authImport=module.match(/from\s+"([^"\n]+firebase_auth[^"\n]*)"/)[1];
 const signIn=async role=>{const custom=await customTokenFor(role);let result;for(let n=0;n<3;n++){result=await js(`(async()=>{try{const a=await import('/src/app/firebase.ts');const f=await import(${JSON.stringify(authImport)});await f.signInWithCustomToken(a.fbAuth,${JSON.stringify(custom)});return {ok:true};}catch(e){return {ok:false,code:e.code||e.name,message:e.message};}})()`);if(result.ok||result.code!=='auth/network-request-failed')break;await delay(1500);}assert.equal(result.ok,true,JSON.stringify(result));await delay(400);};
 const navigate=async(path,required)=>{
  await call('Page.navigate',{url:'http://localhost:5173'+path});
  let text='';for(let i=0;i<150;i++){text=await js('document.body.innerText');if(text.includes(required)&&!text.includes('Cargando')&&!text.includes('Verificando sesión')&&active===0)break;await delay(150);}
  assert.ok(text.includes(required),path+' did not render '+required);assert.ok(!text.includes('MV-87126356')&&!text.includes('7490004'),path+' old record visible');
  screens.push({path,required,text});return text;
 };
 await signIn('admin');
 const dashboard=await navigate('/','Sin mediciones');assert.ok(dashboard.includes('Dashboard operativo'));
 const kpis=await js("[...document.querySelectorAll('.stat-value')].map(e=>e.textContent.trim())");assert.ok(kpis.length>0&&kpis.every(v=>v==='0'||v==='Sin mediciones'),'All rendered operational KPIs empty');
 for(const theme of ['light','dark'])for(const width of [390,1440]){await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await js(`document.documentElement.setAttribute('data-theme',${JSON.stringify(theme)})`);await delay(250);const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(resolve(out,`dashboard-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));}
 for(const [path,title] of [['/equipos-operativos','Equipos en operación'],['/operacion/activos','Gestión de activos'],['/operacion/retiros','Retiros de terreno'],['/operacion/os','Órdenes de servicio'],['/bodega','Recepciones y despachos'],['/bodega/modulos','Inventario de equipos'],['/bodega/dashboard','Dashboard de bodega'],['/lab/asignacion','Gestión de carga'],['/lab/dashboard','Resumen de laboratorio'],['/qa','QA'],['/trazabilidad?q=7490004','Trazabilidad']])await navigate(path,title);
 const fill=async(selector,value)=>js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Search input missing');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
 const searches=[];
 for(const query of ['7490004','MV-87126356','AR-87126356']){
  await fill('input[aria-label="Búsqueda global"]',query);let text='';
  for(let n=0;n<100;n++){text=await js("document.querySelector('#global-search-results')?.innerText||''");if(text.includes('Sin resultados')&&text.includes(query)&&active===0)break;await delay(100);}
  assert.ok(text.includes('Sin resultados')&&text.includes(query),'Global search empty '+query);searches.push({query,text});
 }
 await navigate('/operacion/activos','Gestión de activos');
 await fill('#asset-search-series','7490004');await js("document.querySelector('.asset-search-form').requestSubmit()");
 for(let i=0;i<100;i++){if((await js('document.body.innerText')).includes('No hay coincidencias.'))break;await delay(100);}
 assert.ok((await js('document.body.innerText')).includes('No hay coincidencias.'));
 for(const [role,path,title] of [['tecnico_laboratorio','/mi-jornada','Mi carga'],['tecnico_terreno','/mi-jornada','Mi jornada'],['qa','/qa?etapa=POR_VERIFICAR','Sin equipos en esta consulta'],['logistica','/bodega/dashboard','Dashboard de bodega']]){await signIn(role);await navigate(path,title);}
 assert.equal(blocked.length,0,'No operational writes attempted');assert.ok(requests.every(r=>r.method==='GET'||r.method==='OPTIONS'));
 assert.ok(responses.every(r=>r.status<400),'All actual page API responses successful');
 await js(`(async()=>{const a=await import('/src/app/firebase.ts');const f=await import(${JSON.stringify(authImport)});await f.signOut(a.fbAuth);return true;})()`);
 assert.deepEqual(await fingerprint(db),before);assert.deepEqual(await sequences(db),seqBefore);
 writeFileSync(resolve(out,'report.json'),JSON.stringify({at:new Date().toISOString(),passed:true,web:'http://localhost:5173',api:'http://localhost:4000',noMocks:true,noOperationalWrites:true,screens,searches,requests,responses,blocked},null,2));
 console.log(JSON.stringify({passed:true,pages:screens.length,apiRequests:requests.length,noMocks:true,noOperationalWrites:true,screenshots:4}));
}finally{
 if(js&&authImport)try{await js(`(async()=>{const a=await import('/src/app/firebase.ts');const f=await import(${JSON.stringify(authImport)});await f.signOut(a.fbAuth);return true;})()`);}catch{}
 ws?.close();browser.kill();await db.end();await close();
}
