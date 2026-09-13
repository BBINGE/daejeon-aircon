/* GA4: optional analytics only; no requests before an explicit choice. */
(() => {
  'use strict';
  const ID = 'G-C7WX012ZK8';
  const KEY = 'naengnan-analytics-v1';
  const allowedHosts = ['naengnanmarket.com', 'kimdaegon-aircon.bbinge95.chatgpt.site', 'bbinge.github.io'];
  if (!allowedHosts.includes(location.hostname) || /admin|api\//.test(location.pathname)) return;
  let enabled = false;
  let started = false;
  let choice;
  try { choice = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
  if (!choice || Date.now() - choice.at > 180 * 86400000) choice = null;
  const legal = location.hostname === 'bbinge.github.io' ? '/daejeon-aircon/privacy.html' : '/privacy';
  const cleanPage = () => location.origin + (/privacy/.test(location.pathname) ? legal : /terms/.test(location.pathname) ? location.pathname.split('?')[0] : location.hostname === 'bbinge.github.io' ? '/daejeon-aircon/' : '/');
  let referrer = '';
  try { referrer = new URL(document.referrer).origin; } catch {}
  function start() {
    enabled = true;
    window['ga-disable-' + ID] = false;
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    window.gtag('js', new Date());
    window.gtag('config', ID, {allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 5184000, cookie_update: false, page_location: cleanPage(), page_referrer: referrer, page_title: document.title});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }
  function stop() {
    enabled = false;
    window['ga-disable-' + ID] = true;
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        for (const domain of ['', location.hostname, '.' + location.hostname]) {
          document.cookie = name + '=; Max-Age=0; Path=/' + (domain ? '; Domain=' + domain : '');
        }
      }
    }
  }
  const panel = document.createElement('section');
  panel.className = 'analytics-choice';
  panel.setAttribute('aria-label', '방문 분석 선택');
  panel.innerHTML = '<strong>방문 분석을 허용할까요?</strong><p>방문 경로와 문의 버튼 클릭을 Google Analytics로 분석합니다. 선택 정보의 국외 처리 내용을 <a href="' + legal + '#analytics">개인정보처리방침</a>에서 확인할 수 있습니다. 거절해도 전화·문자 상담은 그대로 이용할 수 있어요.</p><div><button type="button" data-choice="no">거절</button><button type="button" data-choice="yes">분석 및 국외이전 동의</button></div>';
  const settings = document.createElement('button');
  settings.type = 'button'; settings.className = 'analytics-settings'; settings.textContent = '분석 설정';
  settings.addEventListener('click', () => {panel.hidden = false; panel.querySelector('button').focus();});
  panel.addEventListener('click', event => {
    const button = event.target.closest('button[data-choice]');
    if (!button) return;
    const yes = button.dataset.choice === 'yes';
    try { localStorage.setItem(KEY, JSON.stringify({yes, at: Date.now()})); } catch {}
    if (yes) start(); else stop();
    panel.hidden = true;
    settings.focus();
  });
  document.body.append(panel, settings);
  panel.hidden = !!choice;
  if (choice?.yes) start(); else stop();
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || !enabled || !window.gtag) return;
    const href = link.getAttribute('href');
    const type = href?.startsWith('tel:') ? 'phone_click' : href?.startsWith('sms:') ? 'sms_click' : null;
    if (!type) return;
    const position = link.closest('.topbar') ? 'header' : link.closest('.quick-rail') ? 'rail' : link.closest('.sticky') ? 'mobile' : link.closest('footer') ? 'footer' : link.closest('#final-contact') ? 'final' : link.closest('#estimate') ? 'hero' : 'content';
    window.gtag('event', type, {contact_position: position, page_location: cleanPage(), page_referrer: referrer, transport_type: 'beacon'});
  }, {capture: true});
})();
