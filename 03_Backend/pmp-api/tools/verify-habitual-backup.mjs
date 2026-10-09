import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {permanentBackup,pool,hash,pgBin,pgEnv,program,fingerprint,sequences,structure,save} from './database-tools.mjs';
import {ephemeralPostgres} from './ephemeral-postgres.mjs';
const metadata=JSON.parse(readFileSync(resolve(permanentBackup,'habitual-cleanup-backup.json'),'utf8'));
const archive=resolve(permanentBackup,metadata.file);assert.equal(hash(readFileSync(archive)),metadata.sha256);
const fixture=await ephemeralPostgres();let p;
try{
 program(resolve(pgBin(),'pg_restore.exe'),['--exit-on-error','--single-transaction','--dbname','postgres',archive],{env:pgEnv(fixture.url)});
 p=pool(fixture.url,true);
 assert.deepEqual({tables:await fingerprint(p),sequences:await sequences(p),structure:await structure(p)},metadata.before);
}finally{if(p)await p.end();await fixture.dispose();}
const result={at:new Date().toISOString(),backupDirectory:permanentBackup,file:metadata.file,sha256:metadata.sha256,fullRestoreMatch:true,tables:26,sequences:19,temporaryInstanceRemoved:true,habitualDatabaseUnmodified:true};
save('backup-outside-demo-verified.json',result);console.log(JSON.stringify(result));
