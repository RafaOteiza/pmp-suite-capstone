// Reuse the existing mocked Mobile regression cases without editing the Web suite.
// Adapt only its old presentation selectors and FlatList mock to the scrollable header.
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const original=new URL('../../04_Frontend/test/requirements.frontend.test.mjs',import.meta.url);
const require=createRequire(original);
let source=await readFile(original,'utf8');
const replace=(before,after)=>{assert.ok(source.includes(before),'Existing suite presentation changed: '+before);source=source.replaceAll(before,after);};
replace("press(root,'CONFIRMAR RETIRO FÍSICO HACIA BODEGA')","press(root,'Confirmar retiro físico hacia Bodega')");
replace(".find(n=>text(n).includes('IN-000123'))",".find(n=>n.props.accessibilityLabel==='Instalar / devolver equipo')");
replace("FlatList=({data,renderItem})=>React.createElement('List',null,data.map", "FlatList=({data,renderItem,ListHeaderComponent})=>React.createElement('List',null,ListHeaderComponent,data.map");
source=source.replace("const {default:MobileHistory}=", "nativeImports['../context/AuthContext']='data:text/javascript,'+encodeURIComponent('export const useAuth=()=>({user:{rol:\"admin\"}});');\nconst {default:MobileHistory}=");
source=source.replaceAll('import.meta.url',JSON.stringify(original.href)).replaceAll('import.meta.resolve(', '__workspaceResolve(');
source=source.replace(/from '(react|react-test-renderer|typescript)'/g,(_,name)=>'from '+JSON.stringify(pathToFileURL(require.resolve(name)).href));
source=`import {createRequire as workspaceRequire} from 'node:module';import {pathToFileURL as workspaceUrl} from 'node:url';const __workspaceResolve=name=>workspaceUrl(workspaceRequire(${JSON.stringify(original.href)}).resolve(name)).href;\n`+source;
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
