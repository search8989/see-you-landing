/* SEE YOU — Google Analytics 4 + Consent Mode v2 + цілі.
   Лічильник вмикається лише після згоди. До згоди GA не завантажується
   і жодних cookies не ставить. Банер не перекриває нижню панель із
   кнопками «Замовити» / «Заробити». */
(function () {
  var GA = 'G-LQN6RP1NYR';
  var KEY = 'sy_consent';           // "granted" | "denied"
  var APP = 'app.see-you.app';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) window.gtag = function () { window.dataLayer.push(arguments); };

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA, { anonymize_ip: true });
  }

  // ── події ────────────────────────────────────────────────────────────
  function track(name, params) {
    try {
      if (read() !== 'granted') return;
      gtag('event', name, params || {});
    } catch (e) {}
  }
  window.syTrack = track;

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '');
    var label = (a.textContent || '').trim().slice(0, 60);
    var where = location.pathname;

    if (href.indexOf('role=customer') > -1) track('click_order', { label: label, page: where });
    else if (href.indexOf('performer-application') > -1) track('click_earn', { label: label, page: where });
    else if (href.indexOf(APP) > -1) track('click_app', { label: label, page: where });
    else if (href.indexOf('tel:') === 0) track('click_phone', { page: where });
    else if (href.indexOf('mailto:') === 0) track('click_email', { page: where });
  }, true);

  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.tagName === 'DETAILS' && d.open) {
      var q = d.querySelector('summary');
      track('faq_open', { question: q ? q.textContent.trim().slice(0, 90) : '' });
    }
  }, true);

  // ── банер згоди ──────────────────────────────────────────────────────
  function banner() {
    var css = document.createElement('style');
    css.textContent =
      '.sy-consent{position:fixed;left:12px;right:12px;bottom:calc(72px + env(safe-area-inset-bottom));z-index:55;' +
      'max-width:640px;margin:0 auto;background:#fff;color:#1a1a1a;border:1px solid #e5e9f0;border-radius:14px;' +
      'padding:16px 18px;box-shadow:0 18px 50px -20px rgba(16,24,40,.45);font-size:14.5px;line-height:1.55}' +
      '.sy-consent p{margin:0 0 12px}.sy-consent a{color:#2563eb}' +
      '.sy-consent div{display:flex;flex-wrap:wrap;gap:8px}' +
      '.sy-consent button{font:inherit;font-weight:600;cursor:pointer;border-radius:10px;padding:10px 18px;border:1px solid transparent}' +
      '.sy-consent .ok{background:#2563eb;color:#fff}' +
      '.sy-consent .no{background:#fff;color:#2563eb;border-color:#cfdcfa}' +
      '@media(min-width:900px){.sy-consent{bottom:20px}}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.className = 'sy-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Аналітика');
    box.innerHTML =
      '<p>Ми хочемо розуміти, які сторінки корисні, і для цього вмикаємо Google Analytics. ' +
      'Без вашої згоди аналітика не працює. <a href="/privacy">Політика конфіденційності</a></p>' +
      '<div><button type="button" class="ok">Прийняти</button>' +
      '<button type="button" class="no">Лише необхідні</button></div>';

    function decide(ok) {
      save(ok ? 'granted' : 'denied');
      if (ok) { gtag('consent', 'update', { analytics_storage: 'granted' }); load(); }
      box.remove();
    }
    box.querySelector('.ok').addEventListener('click', function () { decide(true); });
    box.querySelector('.no').addEventListener('click', function () { decide(false); });
    document.body.appendChild(box);
  }

  function start() {
    var saved = read();
    if (saved === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      load();
      return;
    }
    if (saved === 'denied') return;
    setTimeout(banner, 1500);   // не заважаємо першому екрану
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
