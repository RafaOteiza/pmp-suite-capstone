// Read-only verification of conservation and actual middleware, never a cleanup.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {pool,sourceUrl,root,fingerprint,sequences,structure} from '../tools/database-tools.mjs';
import {tokenFor,close} from '../tools/habitual-readonly.mjs';
import {assetIdentity} from '../../../shared/assetIdentity.js';
const dir=resolve(root,'.local/pmp-verification/consolidation-2026-10-08');
const baseline=JSON.parse(readFileSync(resolve(dir,'baseline-database.json'),'utf8'));
const db=pool(sourceUrl(),true),users=[];
try{
 for(const role of ['admin','logistica','tecnico_terreno','tecnico_laboratorio','qa','gerente']){
  const response=await fetch('http://localhost:4000/api/auth/me',{headers:{authorization:'Bearer '+await tokenFor(role)}});
  const data=await response.json();users.push({role,status:response.status,confirmedRole:data.user?.rol||null,code:data.code||data.error||null});
 }
 const tables=await fingerprint(db),seq=await sequences(db),schema=await structure(db);
 const assets=(await db.query("SELECT 'VALIDADOR' tipo_equipo,serie,modelo,marca FROM pmp.validadores UNION ALL SELECT 'CONSOLA',serie,modelo,marca FROM pmp.consolas")).rows;
 const incompatible=assets.filter(a=>{const expected=assetIdentity(a.tipo_equipo,a.serie);return expected.status!=='valid'||a.modelo!==expected.modelo||a.marca!==expected.marca;});
 const result={at:new Date().toISOString(),noOperationalWrites:true,authentication:'Firebase custom token for existing accounts; real Firebase verification and PostgreSQL middleware. No password login or physical device.',users,
  tablesUnchanged:isDeepStrictEqual(tables,baseline.tables),sequencesUnchanged:isDeepStrictEqual(seq,baseline.sequences),structureUnchanged:isDeepStrictEqual(schema,baseline.structure),
  incompatibleIdentityCount:incompatible.length,tables,sequences:seq,structure:schema};
 writeFileSync(resolve(dir,'final-readonly.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({users,tablesUnchanged:result.tablesUnchanged,sequencesUnchanged:result.sequencesUnchanged,structureUnchanged:result.structureUnchanged,incompatibleIdentityCount:incompatible.length,noOperationalWrites:true}));
}finally{await db.end();await close();}
