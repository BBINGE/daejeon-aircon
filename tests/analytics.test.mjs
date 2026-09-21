import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const source=readFileSync('public/analytics.js','utf8');
function run(saved, pathname='/', hostname='naengnanmarket.com') {
 const elements=[], requests=[], handlers={}, cookies=[];
 const make=()=>({addEventListener(name,fn){this[name]=fn;},setAttribute(){},querySelector(){return {focus(){}};},focus(){}});
 const doc={title:'냉난방장터',referrer:'https://search.naver.com/search.naver?query=private-phone',createElement(){const el=make();elements.push(el);return el;},head:{appendChild(el){requests.push(el.src);}},body:{append(){}},addEventListener(name,fn){handlers[name]=fn;}};
 Object.defineProperty(doc,'cookie',{get(){return '_ga=123; _ga_C7WX012ZK8=456; essential=keep';},set(v){cookies.push(v);}});
 const storage=new Map(saved?[['naengnan-analytics-v1',JSON.stringify(saved)]]:[]);
 const ctx={window:{},document:doc,location:{hostname,origin:'https://'+hostname,pathname,search:'?phone=01012345678'},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},URL,Date};
 vm.runInNewContext(source,ctx);
 const select=yes=>elements[0].click({target:{closest(){return {dataset:{choice:yes?'yes':'no'}};}}});
 const click=href=>handlers.click({target:{closest(){return {getAttribute(){return href;},closest(s){return s==='#estimate'?{}:null;}};}}});
 const focus=()=>handlers.focusin({target:{closest(s){return s==='.desktop-lead-form'?{}:null;}}});
 return {ctx,elements,requests,cookies,select,click,focus};
}
test('no analytics requests before consent; rejection retains contact behavior',()=>{const a=run();assert.equal(a.requests.length,0);a.select(false);a.click('tel:01091832200');assert.equal(a.requests.length,0);assert.equal(a.ctx.window.dataLayer,undefined);});
test('consent loads one tag and separates phone/SMS with sanitized page and referrer',()=>{const a=run();a.select(true);a.select(true);assert.equal(a.requests.length,1);a.click('tel:01091832200');a.click('sms:01091832200');const commands=Array.from(a.ctx.window.dataLayer,x=>Array.from(x));assert.equal(commands.filter(x=>x[0]==='config').length,1);assert.deepEqual(commands.filter(x=>x[0]==='event').map(x=>x[1]),['phone_click','sms_click']);const config=commands.find(x=>x[0]==='config')[2];assert.equal(config.page_location,'https://naengnanmarket.com/');assert.equal(config.page_referrer,'https://search.naver.com');assert.ok(!JSON.stringify(commands).includes('010'));assert.equal(config.allow_google_signals,false);assert.equal(config.cookie_update,false);});
test('withdrawal blocks events and expires GA cookies only; choice persists',()=>{const a=run({yes:true,at:Date.now()});const n=a.ctx.window.dataLayer.length;a.select(false);a.click('tel:01091832200');assert.equal(a.ctx.window.dataLayer.length,n);assert.equal(a.ctx.window['ga-disable-G-C7WX012ZK8'],true);assert.ok(a.cookies.every(x=>!x.includes('essential')));assert.equal(run({yes:false,at:Date.now()}).requests.length,0);assert.equal(run({yes:true,at:0}).requests.length,0);});
test('consented funnel tracks CTA, form progress and lead without form values',()=>{const a=run();a.select(true);a.click('#pc-inquiry');a.focus();a.focus();a.ctx.window.naengnanTrack('form_submit_attempt',{form_name:'callback_form',phone:'01012345678'});a.ctx.window.naengnanTrack('generate_lead',{method:'callback_form',notification_status:'sent',region:'private'});const commands=Array.from(a.ctx.window.dataLayer,x=>Array.from(x));const events=commands.filter(x=>x[0]==='event');assert.deepEqual(events.map(x=>x[1]),['contact_cta_click','form_start','form_submit_attempt','generate_lead']);assert.ok(!JSON.stringify(events).includes('01012345678'));assert.ok(!JSON.stringify(events).includes('private'));});
test('admin and unknown domains never load tag or choice UI',()=>{assert.equal(run(null,'/admin').elements.length,0);assert.equal(run(null,'/','localhost').elements.length,0);});
