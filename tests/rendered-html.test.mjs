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
 const data={region:'대전',inquiryType:'중고 구매',airconType:'냉난방기',phone:'010-0000-0000',consent:true,consentVersion:'2026-09-13',sourceUrl:'https://example.com/?phone=secret',referrer:'https://example.org/?secret=yes'};
 assert.equal((await call('POST',{...data,consent:false}))[0],400);
 const [status,created]=await call('POST',data);assert.equal(status,201,JSON.stringify(created));
 assert.equal((await call('POST',data))[1].duplicate,true);
 const row=(await call('GET',null,'local-test-key-only'))[1].leads[0];assert.equal(row.consentVersion,'2026-09-13');assert.ok(row.consentAt);assert.equal(row.sourceUrl,'https://example.com/');assert.equal(row.referrer,'https://example.org');
 assert.equal((await call('PATCH',{id:created.id,status:'closed'},'local-test-key-only'))[0],200);
 const closed=(await call('GET',null,'local-test-key-only'))[1].leads[0];assert.ok(closed.closedAt);assert.ok(closed.deleteAfter);
 await db.prepare("UPDATE leads SET delete_after = '2020-01-01 00:00:00' WHERE id = ?").bind(created.id).run();
 assert.equal((await call('GET',null,'local-test-key-only'))[1].leads.length,0);
 for(const url of ['/','/privacy','/terms']){const r=await mf.dispatchFetch('http://localhost'+url);assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('김대곤'));assert.ok(!html.includes('[대표 확인 필요]'));}
 console.log('PASS: local D1 migrations, consent, auth, duplicate prevention, new enquiry, URL minimization, closure and expiry purge, three pages. No production data used.');
}finally{await mf.dispose();}
