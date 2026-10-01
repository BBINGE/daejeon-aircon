import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const source=readFileSync('public/analytics.js','utf8');
function run(saved, pathname='/', hostname='naengnanmarket.com') {
 const elements=[], requests=[], handlers={};
 const doc={title:'냉난방장터',referrer:'https://search.naver.com/search.naver?query=private-phone',createElement(type){const el={type};elements.push(el);return el;},head:{appendChild(el){requests.push(el.src);}},querySelector(){return null;},addEventListener(name,fn){handlers[name]=fn;}};
 const storage=new Map(saved?[['naengnan-analytics-v1',JSON.stringify(saved)]]:[]);
 const ctx={window:{},document:doc,location:{hostname,origin:'https://'+hostname,pathname,search:'?phone=01012345678'},localStorage:{getItem:k=>storage.get(k)},URL,Date};
 vm.runInNewContext(source,ctx);
 const click=href=>handlers.click({target:{closest(){return {getAttribute(){return href;},closest(s){return s==='#estimate'?{}:null;}};}}});
 const focus=()=>handlers.focusin({target:{closest(s){return s==='.desktop-lead-form'?{}:null;}}});
 const commands=()=>Array.from(ctx.window.dataLayer||[],x=>Array.from(x));
 return {ctx,elements,requests,click,focus,commands};
}

test('first visit loads analytics without creating consent UI',()=>{const a=run();assert.equal(a.requests.length,1);assert.ok(a.requests[0].endsWith('G-C7WX012ZK8'));assert.deepEqual(a.elements.map(el=>el.type),['script']);assert.equal(a.commands().filter(x=>x[0]==='config').length,1);});
test('old browser choices no longer prevent startup or phone clicks',()=>{for(const saved of [{yes:false,at:Date.now()},{yes:true,at:0}]){const a=run(saved);a.click('tel:01091832200');assert.equal(a.requests.length,1);assert.deepEqual(a.commands().filter(x=>x[0]==='event').map(x=>x[1]),['phone_click']);}});
test('phone and SMS remain distinct and URLs contain no private query data',()=>{const a=run();a.click('tel:01091832200');a.click('sms:01091832200');const commands=a.commands();assert.deepEqual(commands.filter(x=>x[0]==='event').map(x=>x[1]),['phone_click','sms_click']);const config=commands.find(x=>x[0]==='config')[2];assert.equal(config.page_location,'https://naengnanmarket.com/');assert.equal(config.page_referrer,'https://search.naver.com');assert.ok(!JSON.stringify(commands).includes('010'));assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.equal(config.cookie_update,false);});
test('funnel records first focus once and excludes consultation values',()=>{const a=run();a.click('#pc-inquiry');a.focus();a.focus();a.ctx.window.naengnanTrack('form_submit_attempt',{form_name:'callback_form',phone:'01012345678'});a.ctx.window.naengnanTrack('generate_lead',{method:'callback_form',notification_status:'sent',region:'private'});const events=a.commands().filter(x=>x[0]==='event');assert.deepEqual(events.map(x=>x[1]),['contact_cta_click','form_start','form_submit_attempt','generate_lead']);assert.ok(!JSON.stringify(events).includes('01012345678'));assert.ok(!JSON.stringify(events).includes('private'));});
test('admin, API and unknown domains never load analytics',()=>{for(const path of ['/admin','/api/leads'])assert.equal(run(null,path).requests.length,0);assert.equal(run(null,'/','localhost').requests.length,0);});
