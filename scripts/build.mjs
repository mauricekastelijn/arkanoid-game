import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'_site');
for(const name of ['index.html','style.css','game.js','engine.js','icon.svg'])if(!(await readFile(path.join(root,'dist',name))).length)throw new Error(`Empty asset: ${name}`);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await cp(path.join(root,'dist'),path.join(out,'dist'),{recursive:true});
await cp(path.join(root,'index.html'),path.join(out,'index.html'));await writeFile(path.join(out,'.nojekyll'),'');
console.log('Built _site/ with root launcher and complete game.');
