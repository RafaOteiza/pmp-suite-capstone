import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pool } from '../src/db.js';

// Apply only additive schema changes. No operational row is rewritten.
const client=await pool.connect();
try {
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout='5s'");
  await client.query(`LOCK TABLE pmp.ordenes_servicio,pmp.bridges,pmp.bridge_mantenimiento,
    pmp.validadores,pmp.consolas,pmp.repuestos IN SHARE MODE`);
  const snapshot=async()=>{
    const result={};
    for(const table of ['ordenes_servicio','bridges','bridge_mantenimiento','validadores','consolas','repuestos']){
      result[table]=(await client.query(`SELECT count(*)::int AS registros,
        md5(COALESCE(string_agg(row_to_json(t)::text,'' ORDER BY row_to_json(t)::text),'')) AS firma FROM pmp.${table} t`)).rows[0];
    }
    return result;
  };
  const before=await snapshot();
  const sql=await readFile(new URL('../../../05_BaseDatos/migraciones/bridge/002_bridge_correlacion.sql',import.meta.url),'utf8');
  await client.query(sql.replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,''));
  assert.deepEqual(await snapshot(),before,'La migración debe conservar los datos operacionales');
  await client.query('COMMIT');
  console.log(JSON.stringify({ok:true,operationalRowsUnchanged:true,tables:before},null,2));
}catch(e){await client.query('ROLLBACK');throw e;}
finally{client.release();await pool.end();}
