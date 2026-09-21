import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = wranglerRequire('miniflare');
let mailCount = 0;

const mf = new Miniflare({
  modules: readdirSync('dist/server', { recursive: true }).filter(file => String(file).endsWith('.js')).sort((a, b) => a === 'index.js' ? -1 : b === 'index.js' ? 1 : 0).map(file => ({ type: 'ESModule', path: path.resolve('dist/server', String(file)) })),
  modulesRoot: path.resolve('dist/server'),
  modulesRules: [{ type: 'ESModule', include: ['**/*.js'] }],
  compatibilityDate: '2026-05-22',
  compatibilityFlags: ['nodejs_compat'],
  d1Databases: ['DB'],
  bindings: { ADMIN_KEY: 'local-test-key-only', LEAD_NOTIFY_EMAIL: 'lead-test@example.invalid' },
  outboundService: async request => {
    assert.equal(new URL(request.url).hostname, 'formsubmit.co');
    assert.equal(request.headers.get('referer'), 'https://naengnanmarket.com/');
    mailCount++;
    if ((await request.text()).includes('중고 매입')) return Response.json({ success: 'false' }, { status: 503 });
    return Response.json({ success: 'true' });
  },
});

try {
  const db = await mf.getD1Database('DB');
  for (const file of readdirSync('drizzle').filter(file => file.endsWith('.sql')).sort()) {
    for (const sql of readFileSync('drizzle/' + file, 'utf8').split('--> statement-breakpoint').map(statement => statement.trim()).filter(Boolean)) await db.prepare(sql).run();
  }
  const call = async (method, body, key = '', origin = 'https://naengnanmarket.com') => {
    const response = await mf.dispatchFetch('http://localhost/api/leads', {
      method,
      headers: { 'Content-Type': 'application/json', Origin: origin, ...(key ? { 'X-Admin-Key': key } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return [response.status, await response.json()];
  };
  assert.equal((await call('GET'))[0], 401);
  assert.equal((await call('POST', { phone: '010-0000-0000' }, '', 'https://untrusted.example'))[0], 403);
  assert.equal((await call('POST', { phone: '123' }))[0], 400);
  const lead = { phone: '010-0000-0000', inquiryType: '에어컨 설치', region: '대전 서구' };
  assert.equal((await call('POST', lead))[0], 200);
  assert.equal((await call('POST', lead))[1].duplicate, true);
  const failedAlert = await call('POST', { phone: '010-1111-2222', inquiryType: '중고 매입' });
  assert.equal(failedAlert[0], 200);
  assert.equal(failedAlert[1].notificationPending, true);
  const rows = (await call('GET', null, 'local-test-key-only'))[1].leads;
  assert.equal(rows.length, 2);
  assert.equal(rows[1].phone, '01000000000');
  assert.equal(rows[1].inquiryType, '에어컨 설치');
  assert.equal(rows[1].consentVersion, null);
  assert.equal(rows[1].consentAt, null);
  assert.equal((await db.prepare('select count(*) as count from leads').first()).count, 2);
  assert.equal(mailCount, 2);

  const home = await (await mf.dispatchFetch('http://localhost/')).text();
  assert.ok(home.includes('id="pc-inquiry"'));
  assert.ok(home.includes('>상담 신청하기</button>'));
  assert.ok(home.includes('입력하신 번호로 상담 전화를 드립니다.'));
  assert.ok(!home.includes('박성호의 접수'));
  assert.ok(!home.includes('desktop-lead-consent'));
  assert.ok(home.includes('접수 내용을 확인한 뒤 김대곤 대표가 전화드립니다.'));
  assert.ok(home.includes('href="sms:01091832200"'));
  assert.ok(home.includes('href="tel:01091832200"'));
  for (const url of ['/', '/privacy', '/terms']) {
    const response = await mf.dispatchFetch('http://localhost' + url);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('김대곤'));
    assert.ok(!html.includes('[대표 확인 필요]'));
  }
  console.log('PASS: desktop intake validates, stores once, sends alert, protects admin, and preserves direct phone/SMS links.');
} finally {
  await mf.dispose();
}
