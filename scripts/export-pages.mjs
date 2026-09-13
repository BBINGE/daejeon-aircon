import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,readdirSync,cpSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const req=createRequire(import.meta.url);
const {Miniflare}=createRequire(req.resolve('wrangler/package.json'))('miniflare');
const root=path.resolve('dist/server');
const modules=readdirSync(root,{recursive:true}).filter(x=>String(x).endsWith('.js')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0).map(x=>({type:'ESModule',path:path.resolve(root,String(x))}));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat']});
const base='/daejeon-aircon';
function rewrite(s){return s.replaceAll('/_next/',base+'/_next/').replaceAll('/images/',base+'/images/').replaceAll('/favicon.svg',base+'/favicon.svg').replaceAll('href="/"','href="'+base+'/"').replaceAll('href="/#','href="'+base+'/#').replaceAll('href:"/"','href:"'+base+'/"').replaceAll('href:"/#','href:"'+base+'/#').replaceAll('"/privacy"','"'+base+'/privacy.html"').replaceAll('"/terms"','"'+base+'/terms.html"').replaceAll('\\"/privacy\\"','\\"'+base+'/privacy.html\\"').replaceAll('\\"/terms\\"','\\"'+base+'/terms.html\\"').replaceAll('\\"/\\"','\\"'+base+'/\\"').replaceAll('\\"/#','\\"'+base+'/#');}
try{
 mkdirSync('docs',{recursive:true});
 cpSync('dist/client','docs',{recursive:true});
 for(const file of readdirSync('dist/client',{recursive:true}).filter(x=>/\.(js|css)$/.test(String(x)))){
  writeFileSync(path.join('docs',String(file)),rewrite(readFileSync(path.join('dist/client',String(file)),'utf8')));
 }
 for(const [route,file] of [['/','index.html'],['/privacy','privacy.html'],['/terms','terms.html']]){
  const response=await mf.dispatchFetch('https://local.test'+route);
  if(response.status!==200)throw Error(route+' returned '+response.status);
  writeFileSync('docs/'+file,rewrite(await response.text()));
 }
 const css=readdirSync('dist/client/_next/static/css').find(x=>x.endsWith('.css'));
 let admin=readFileSync('docs/admin.html','utf8').replace(/\.\/_next\/static\/css\/[^"\s]+\.css/,'./_next/static/css/'+css);
 writeFileSync('docs/admin.html',admin);
 writeFileSync('docs/.nojekyll','');
 console.log('Exported homepage, privacy, terms and assets; preserved standalone admin.');
}finally{await mf.dispose();}
