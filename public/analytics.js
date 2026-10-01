/* GA4: measure site interactions without collecting consultation form values. */
(() => {
  'use strict';
  const ID = 'G-C7WX012ZK8';
  const allowedHosts = ['naengnanmarket.com', 'kimdaegon-aircon.bbinge95.chatgpt.site', 'bbinge.github.io'];
  if (!allowedHosts.includes(location.hostname) || /admin|api\//.test(location.pathname)) return;
  let enabled = false;
  let started = false;
  const legal = location.hostname === 'bbinge.github.io' ? '/daejeon-aircon/privacy.html' : '/privacy';
  const cleanPage = () => location.origin + (/privacy/.test(location.pathname) ? legal : /terms/.test(location.pathname) ? location.pathname.split('?')[0] : location.hostname === 'bbinge.github.io' ? '/daejeon-aircon/' : '/');
  let referrer = '';
  try { referrer = new URL(document.referrer).origin; } catch {}
  const allowedEvents = new Set(['phone_click', 'sms_click', 'contact_cta_click', 'section_view', 'form_view', 'form_start', 'form_submit_attempt', 'form_submit_duplicate', 'generate_lead', 'form_submit_error']);
  const allowedParams = new Set(['contact_position', 'target_section', 'section_name', 'form_name', 'method', 'notification_status', 'error_type']);
  const sentOnce = new Set();
  let funnelStarted = false;
  function safeParams(params) {
    const result = {};
    for (const [key, value] of Object.entries(params || {})) {
      if (!allowedParams.has(key) || (typeof value !== 'string' && typeof value !== 'boolean')) continue;
      result[key] = typeof value === 'string' ? value.slice(0, 60) : value;
    }
    return result;
  }
  function track(name, params) {
    if (!enabled || !window.gtag || !allowedEvents.has(name)) return;
    window.gtag('event', name, {...safeParams(params), page_location: cleanPage(), page_referrer: referrer, transport_type: 'beacon'});
  }
  function trackOnce(key, name, params) {
    if (sentOnce.has(key)) return;
    sentOnce.add(key);
    track(name, params);
  }
  function contactPosition(link) {
    return link.closest('.topbar') ? 'header' : link.closest('.quick-rail') ? 'rail' : link.closest('.sticky') ? 'mobile' : link.closest('footer') ? 'footer' : link.closest('#final-contact') ? 'final' : link.closest('#estimate') ? 'hero' : 'content';
  }
  function startFunnelTracking() {
    if (funnelStarted) return;
    funnelStarted = true;
    if (typeof IntersectionObserver !== 'function') return;
    const targets = [
      ['#estimate', 'contact'],
      ['#service', 'services'],
      ['#work', 'work'],
      ['#area', 'area'],
      ['#faq', 'faq'],
      ['#final-contact', 'final_contact'],
    ];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const sectionName = entry.target.getAttribute('data-ga-section');
        if (sectionName) trackOnce('section:' + sectionName, 'section_view', {section_name: sectionName});
        if (entry.target.id === 'callback-form-panel') trackOnce('form:view', 'form_view', {form_name: 'callback_form'});
        observer.unobserve(entry.target);
      }
    }, {threshold: 0.15, rootMargin: '0px 0px -8% 0px'});
    for (const [selector, sectionName] of targets) {
      const element = document.querySelector(selector);
      if (!element) continue;
      element.setAttribute('data-ga-section', sectionName);
      observer.observe(element);
    }
    const form = document.querySelector('#callback-form-panel');
    if (form) observer.observe(form);
  }
  window.naengnanTrack = track;
  function start() {
    enabled = true;
    window['ga-disable-' + ID] = false;
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID, {allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 5184000, cookie_update: false, page_location: cleanPage(), page_referrer: referrer, page_title: document.title});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
    startFunnelTracking();
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || !enabled || !window.gtag) return;
    const href = link.getAttribute('href');
    const type = href?.startsWith('tel:') ? 'phone_click' : href?.startsWith('sms:') ? 'sms_click' : null;
    const position = contactPosition(link);
    if (type) track(type, {contact_position: position});
    else if (href === '#pc-inquiry') track('contact_cta_click', {contact_position: position, target_section: 'callback_form'});
    else if (href === '#estimate') track('contact_cta_click', {contact_position: position, target_section: 'contact'});
  }, {capture: true});
  document.addEventListener('focusin', event => {
    if (!enabled || !event.target?.closest?.('.desktop-lead-form')) return;
    trackOnce('form:start', 'form_start', {form_name: 'callback_form'});
  }, {capture: true});
  start();
})();
