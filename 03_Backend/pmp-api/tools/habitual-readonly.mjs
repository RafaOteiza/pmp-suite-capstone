// Verification of the normal running API. Operational requests are strictly GET.
// Uses the same Firebase custom-token verification pattern as bridge_http_readonly.mjs.
// No password/claim/account changes; no tokens written to artifacts.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {parse} from 'dotenv';
import {pool,sourceUrl,sourceEnv,root,local,save,program,fingerprint,sequences} from './database-tools.mjs';
Object.assign(process.env,sourceEnv());
const {default:admin}=await import('../src/firebase.js');
const front=parse(readFileSync(resolve(root,'04_Frontend/.env')));
const p=pool(sourceUrl(),true),tokens=new Map();
export async function customTokenFor(role){
 const u=(await p.query('select correo from pmp.usuarios where rol=$1 and activo=true',[role])).rows[0];assert.ok(u,'Existing user '+role);
 const user=await admin.auth().getUserByEmail(u.correo);assert.equal(user.disabled,false);
 return admin.auth().createCustomToken(user.uid);
}
export async function tokenFor(role){
 if(tokens.has(role))return tokens.get(role);
 const custom=await customTokenFor(role);
 const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(front.VITE_FB_API_KEY),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
 const d=await r.json();assert.equal(r.status,200,'Firebase authentication failed');tokens.set(role,d.idToken);return d.idToken;
}
export async function get(role,path){assert.ok(path.startsWith('/api/'));const r=await fetch('http://localhost:4000'+path,{headers:{authorization:'Bearer '+await tokenFor(role)},signal:AbortSignal.timeout(90000)});const d=await r.json();assert.equal(r.status,200,path+' status '+r.status);return d;}
export async function close(){tokens.clear();await p.end();await admin.app().delete();}
async function connections(){
 const summary=await get('admin','/api/dashboard/summary');
 const tcp=JSON.parse(program('powershell.exe',['-NoProfile','-Command',"@(Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 4000,5173,8081; Get-NetTCPConnection -State Established | Where-Object RemotePort -eq 5432) | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,OwningProcess,State | ConvertTo-Json"],{encoding:'utf8'}));
 const apiPid=tcp.find(t=>t.LocalPort===4000).OwningProcess;
 const activity=(await p.query("select pid,datname,host(client_addr) client_addr,client_port,state from pg_stat_activity where backend_type='client backend'")).rows;
 const matched=tcp.filter(t=>t.OwningProcess===apiPid&&t.RemotePort===5432).map(t=>({tcp:t,postgres:activity.find(a=>a.client_port===t.LocalPort)}));
 assert.ok(matched.length&&matched.every(m=>m.postgres?.datname==='pmp_suite'&&['::1','127.0.0.1'].includes(m.tcp.RemoteAddress)),'Normal API must actually connect to local pmp_suite');
 const module=await(await fetch('http://localhost:5173/src/api/http.ts')).text();
 const envMatch=module.match(/import\.meta\.env\s*=\s*({[^\n]*});/);assert.ok(envMatch,'Vite effective environment');
 const env=JSON.parse(envMatch[1]);const webApi=env.VITE_CORE_URL??env.VITE_API_URL??'http://localhost:4000';assert.equal(new URL(webApi).port,'4000');assert.ok(['localhost','127.0.0.1'].includes(new URL(webApi).hostname));
 const manifest=await(await fetch('http://127.0.0.1:8081/',{headers:{'expo-platform':'android',accept:'application/json'}})).json();
 const bundleUrl=new URL(manifest.launchAsset.url);bundleUrl.hostname='127.0.0.1';bundleUrl.searchParams.set('lazy','false');bundleUrl.searchParams.set('transform.bytecode','0');
 const bundleResponse=await fetch(bundleUrl);assert.equal(bundleResponse.status,200);const bundle=await bundleResponse.text();
 const mobileUrls=[...new Set([...bundle.matchAll(/http:\/\/(?:\d+\.\d+\.\d+\.\d+|localhost):(?:4000|4100)\/api/g)].map(m=>m[0]))];
 assert.ok(mobileUrls.some(u=>new URL(u).port==='4000')&&!mobileUrls.some(u=>new URL(u).port==='4100'),'Normal Expo must target 4000');
 const addresses=JSON.parse(program('powershell.exe',['-NoProfile','-Command',"@(Get-NetIPAddress -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress) | ConvertTo-Json"],{encoding:'utf8'}));
 assert.ok(mobileUrls.every(u=>addresses.includes(new URL(u).hostname)||new URL(u).hostname==='localhost'),'Every Mobile API host must belong to this local computer');
 const mobileApi=mobileUrls.find(u=>!u.includes('127.0.0.1')&&!u.includes('localhost'));
 if(mobileApi){const r=await fetch(mobileApi+'/dashboard/summary',{headers:{authorization:'Bearer '+await tokenFor('admin')}});assert.equal(r.status,200);assert.deepEqual(await r.json(),summary,'LAN and localhost API return same actual data');}
 const result={at:new Date().toISOString(),apiPid,api:'http://localhost:4000',web:'http://localhost:5173',webApi,mobileUrls,mobilePort:8081,matchedConnections:matched,apiToOriginalVerified:true,webTo4000Verified:true,mobileTo4000Verified:true,dashboardBefore:summary};
 save('habitual-connections.json',result);console.log(JSON.stringify(result));
}
async function empty(){
 const before=await fingerprint(p),seq=await sequences(p),responses={};
 const call=async(role,path)=>responses[path]=await get(role,path);
 for(const path of ['/api/os','/api/os/pendientes-retiro','/api/dashboard/equipos-operativos','/api/dashboard/global-search?q=749','/api/requerimientos','/api/activos?tipo_equipo=VALIDADOR&q=749','/api/bridge/buscar?q=749','/api/lab/queue/VALIDADOR','/api/lab/queue/CONSOLA','/api/lab/completed']){const d=await call('admin',path);assert.ok(Array.isArray(d)?d.length===0:JSON.stringify(d).includes('[]'),path+' empty');}
 for(const type of ['VALIDADOR','CONSOLA'])for(const path of ['/api/requerimientos/operativos?tipo_equipo='+type,'/api/activos?tipo_equipo='+type]){const d=await call('admin',path);assert.ok(Array.isArray(d)?d.length===0:JSON.stringify(d).includes('[]'));}
 for(const etapa of ['RECEPCION','AMBIENTE','PRUEBAS','DESPACHO','POR_VERIFICAR','HISTORIAL']){const d=await call('qa','/api/qa/dashboard?etapa='+etapa);assert.equal(d.total,0);assert.equal(d.items.length,0);assert.ok(Object.values(d.counts).every(v=>v===0));}
 const badge=await call('admin','/api/dashboard/badges');assert.ok(Object.values(badge).every(v=>v===0));
 const dash=await call('admin','/api/dashboard/summary');assert.ok(Object.values(dash.kpis).every(v=>v===0||v===null));assert.equal(dash.kpis.tiempoPromedio,null);
 assert.equal((await call('logistica','/api/bodega/queue')).length,0);
 assert.deepEqual(await call('logistica','/api/bodega/stock'),{listos:[],inventario:{validadores:0,consolas:0,total:0}});
 const warehouse=await call('logistica','/api/bodega/dashboard');assert.equal(warehouse.equiposEnRuta,0);assert.equal(warehouse.equiposAsignados,0);assert.equal(warehouse.distribucionEstados.length,0);assert.equal(warehouse.alertasStock,24);
 const parts=await call('logistica','/api/bodega/repuestos');assert.equal(parts.repuestos.length,24);assert.ok(parts.repuestos.every(r=>r.stock===0));
 assert.deepEqual(await call('admin','/api/ai/predictive-report'),[]);
 for(const role of ['admin','logistica','tecnico_terreno','tecnico_laboratorio','qa','gerente']){const me=await get(role,'/api/auth/me');assert.equal(me.user.rol,role);}
 assert.deepEqual(await fingerprint(p),before);assert.deepEqual(await sequences(p),seq);
 const result={at:new Date().toISOString(),api:'http://localhost:4000',noOperationalWrites:true,usersVerified:6,passed:true,responses};save('habitual-api-empty.json',result);console.log(JSON.stringify({passed:true,api:result.api,getEndpoints:Object.keys(responses).length,usersVerified:6,noOperationalWrites:true,dashboard:dash.kpis,badges:badge,partsAlerts:warehouse.alertasStock}));
}
if(process.argv[1]?.endsWith('habitual-readonly.mjs'))try{const mode=process.argv[2];if(mode==='connections')await connections();else if(mode==='empty')await empty();else throw Error('Use connections or empty');}finally{await close();}
