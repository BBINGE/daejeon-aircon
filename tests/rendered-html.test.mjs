import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const req=createRequire(import.meta.url);const wr=createRequire(req.resolve('wrangler/package.json'));const {Miniflare}=wr('miniflare');
const mf=new Miniflare({modules:readdirSync('dist/server',{recursive:true}).filter(x=>String(x).endsWith('.js')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0).map(x=>({type:'ESModule',path:path.resolve('dist/server',String(x))})),modulesRoot:path.resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js']}],compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{ADMIN_KEY:'local-test-key-only'}});
try{
 const db=await mf.getD1Database('DB');
 for(const f of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(sql).run();
 const call=async(method,body,key='')=>{const r=await mf.dispatchFetch('http://localhost/api/leads',{method,headers:{'Content-Type':'application/json',...(key?{'X-Admin-Key':key}:{})},...(body?{body:JSON.stringify(body)}:{})});return [r.status,await r.json()];};
 assert.equal((await call('GET'))[0],401);
 assert.equal((await call('POST',{phone:'010-0000-0000',consent:true}))[0],410);
 assert.equal((await call('GET',null,'local-test-key-only'))[1].leads.length,0);
 const home=await (await mf.dispatchFetch('http://localhost/')).text();
 assert.ok(!home.includes('<form'));assert.ok(home.includes('href="sms:01091832200"'));assert.ok(home.includes('href="tel:01091832200"'));
 for(const url of ['/','/privacy','/terms']){const r=await mf.dispatchFetch('http://localhost'+url);assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('김대곤'));assert.ok(!html.includes('[대표 확인 필요]'));}
 console.log('PASS: closed intake returns 410 without saving, admin auth, phone/SMS links, no forms, policy pages.');
}finally{await mf.dispose();}
