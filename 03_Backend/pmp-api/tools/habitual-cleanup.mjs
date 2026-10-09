// One-time, explicitly requested local maintenance. Never called by application startup.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {sourceUrl,pool,local,quote,literal,hash,save,tables,fingerprint,sequences,structure,assertKnownTables,configuration,operational,pgBin,pgEnv,program,permanentBackup} from './database-tools.mjs';
const mode=process.argv[2]||'inspect';
const load=name=>JSON.parse(readFileSync(resolve(permanentBackup,name),'utf8'));
const target=sourceUrl();assert.equal(target.port||'5432','5432');
const reportName='habitual-cleanup-backup.json';
const qtables=operational.map(t=>'pmp.'+quote(t)).join(', ');
async function identity(c){
 const r=(await c.query("select current_database() database,host(inet_server_addr()) host,inet_server_port() port,version() version")).rows[0];
 assert.equal(r.database,'pmp_suite');assert.equal(r.port,5432);assert.ok(['127.0.0.1','::1'].includes(r.host));return r;
}
async function snap(c){return {tables:await fingerprint(c),sequences:await sequences(c),structure:await structure(c)};}
async function catalogWithoutStock(c){return (await c.query("select coalesce(jsonb_agg(to_jsonb(r)-'stock' order by id),'[]'::jsonb) catalog from pmp.repuestos r")).rows[0].catalog;}
async function cleanup(c,before){
 await c.query('TRUNCATE TABLE '+qtables+' CONTINUE IDENTITY RESTRICT');
 await c.query('UPDATE pmp.repuestos SET stock=0 WHERE stock<>0');
 const after=await snap(c);
 for(const t of operational)assert.equal(after.tables['"pmp"."'+t+'"'].count,0,t);
 for(const t of configuration.filter(t=>t!=='repuestos'))assert.deepEqual(after.tables['"pmp"."'+t+'"'],before.tables['"pmp"."'+t+'"'],t+' preserved');
 assert.deepEqual(after.sequences,before.sequences,'Sequences preserved');
 assert.deepEqual(after.structure,before.structure,'Constraints/triggers/schema preserved');
 assert.equal(Number((await c.query('select coalesce(sum(stock),0) n from pmp.repuestos')).rows[0].n),0);
 return after;
}
const p=pool(target,mode!=='apply');let client;
try{
 await identity(p);assertKnownTables(await tables(p));
 if(mode==='inspect'){
  const dependencies=(await p.query("select conrelid::regclass::text source,confrelid::regclass::text target,pg_get_constraintdef(oid) definition from pg_constraint where contype='f' and connamespace='pmp'::regnamespace order by 1,2")).rows;
  const triggers=(await p.query("select tgrelid::regclass::text relation,tgname,tgenabled,pg_get_triggerdef(oid) definition from pg_trigger where not tgisinternal order by 1,2")).rows;
  const columns=(await p.query("select table_name,column_name,data_type from information_schema.columns where table_schema='pmp' order by table_name,ordinal_position")).rows;
  const activity=(await p.query("select pid,datname,client_addr::text,client_port,application_name,state from pg_stat_activity where backend_type='client backend'")).rows;
  const result={at:new Date().toISOString(),identity:await identity(p),snapshot:await snap(p),dependencies,triggers,columns,activity};save('habitual-inspection.json',result);
  console.log(JSON.stringify({identity:result.identity,counts:Object.fromEntries(Object.entries(result.snapshot.tables).map(([k,v])=>[k,v.count])),activity,triggers}));
 }else if(mode==='backup'){
  assert.ok(!existsSync(resolve(permanentBackup,reportName)),'Do not overwrite an existing maintenance backup');
  client=await p.connect();await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const exported=(await client.query('select pg_export_snapshot() snapshot')).rows[0].snapshot;
  const before=await snap(client),date=new Date().toISOString();
  const file='pmp_suite-before-habitual-cleanup-'+date.replaceAll(':','-').replaceAll('.','-')+'.dump';
  program(resolve(pgBin(),'pg_dump.exe'),['--format=custom','--snapshot',exported,'--file',resolve(local,file)],{env:pgEnv(target)});
  const roles=(await client.query('select rolname,rolsuper,rolcanlogin from pg_roles where rolname not like \'pg_%\' order by rolname')).rows;
  const report={at:date,identity:await identity(client),file,sha256:hash(readFileSync(resolve(local,file))),before,roles,partsCatalog:await catalogWithoutStock(client)};
  await client.query('COMMIT');save(reportName,report);console.log(JSON.stringify({backup:file,sha256:report.sha256,tables:Object.keys(before.tables).length}));
 }else if(mode==='restore-check'){
  await import('./verify-habitual-backup.mjs');
 }else if(mode==='apply'){
  assert.equal(process.argv[3],'--authorized-local-pmp-suite-once','Explicit one-time mode required');
  assert.ok(!existsSync(resolve(permanentBackup,'habitual-cleanup-completed.json')),'Already applied; later manual work must be preserved');
  const b=load(reportName),r=load('habitual-restore-check.json'),connections=load('habitual-connections.json');
  assert.equal(r.sha256,b.sha256);assert.ok(r.fullRestoreMatch&&r.cleanupRehearsalPassed&&r.rehearsalRolledBack);
  assert.equal(hash(readFileSync(resolve(permanentBackup,b.file))),b.sha256);
  assert.ok(connections.apiToOriginalVerified&&connections.webTo4000Verified&&connections.mobileTo4000Verified,'Effective connections required');
  assert.ok(Date.now()-Date.parse(connections.at)<30*60*1000,'Refresh connection proof');
  client=await p.connect();await client.query('BEGIN');
  try{
   await client.query("SET LOCAL lock_timeout='10s'");
   // Locks prevent writes racing the verified snapshot. No CASCADE or trigger disabling.
   await client.query('LOCK TABLE '+[...configuration,...operational].map(t=>'pmp.'+quote(t)).join(', ')+' IN ACCESS EXCLUSIVE MODE');
   await identity(client);const before=await snap(client);assert.deepEqual(before,b.before,'Live data changed since backup; stop and obtain another verified backup');
   assert.deepEqual(await catalogWithoutStock(client),b.partsCatalog);
   const after=await cleanup(client,b.before);assert.deepEqual(await catalogWithoutStock(client),b.partsCatalog);
   const report={at:new Date().toISOString(),identity:await identity(client),backup:b.file,backupSha256:b.sha256,before,after,operationalRowsDeleted:Object.fromEntries(operational.map(t=>[t,b.before.tables['"pmp"."'+t+'"'].count])),partsStockZero:true,configurationPreserved:true};
   save('habitual-cleanup-pending-commit.json',report);
   await client.query('COMMIT');save('habitual-cleanup-completed.json',report);
   console.log(JSON.stringify({committed:true,operationalRowsDeleted:report.operationalRowsDeleted,configurationPreserved:true,partsStockZero:true}));
  }catch(e){await client.query('ROLLBACK');throw e;}
 }else throw Error('Use inspect, backup, restore-check, or explicit one-time apply');
}finally{if(client)client.release();await p.end();}
