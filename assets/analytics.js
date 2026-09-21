/* SEE YOU — Google Analytics 4 з попередньою згодою.
   До згоди GA не завантажується і жодних аналітичних cookies не ставить
   (Consent Mode v2: усе denied за замовчуванням). Це вимога GDPR та ePrivacy
   для відвідувачів з ЄС і водночас безпечний варіант для України.
   Вибір зберігається в localStorage і його можна змінити будь-коли:
   посилання «Налаштування cookies» у підвалі. */
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

  // ── події (працюють лише після згоди) ───────────────────────────────
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
    else if (href.indexOf('performer-application') > -1 || href.indexOf('/vykonavtsyam') > -1 || href.indexOf('role=performer') > -1) track('click_earn', { label: label, page: where });
    else if (href.indexOf(APP) > -1) track('click_app', { label: label, page: where });
    else if (href.indexOf('mailto:') === 0) track('click_email', { page: where });
  }, true);

  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.tagName === 'DETAILS' && d.open) {
      var q = d.querySelector('summary');
      track('faq_open', { question: q ? q.textContent.trim().slice(0, 90) : '' });
    }
  }, true);

  // ── банер згоди ─────────────────────────────────────────────────────
  var box = null;

  function decide(ok) {
    save(ok ? 'granted' : 'denied');
    if (ok) {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      load();
    }
    else {
      // Відмова після згоди: GA вже міг завантажитись, тож відкликаємо явно,
      // вимикаємо збір і прибираємо його cookies — не лише ховаємо банер.
      gtag('consent', 'update', { analytics_storage: 'denied' });
      window['ga-disable-' + GA] = true;
      try {
        document.cookie.split(';').forEach(function (c) {
          var n = c.split('=')[0].trim();
          if (n.indexOf('_ga') === 0) {
            document.cookie = n + '=; Max-Age=0; path=/';
            document.cookie = n + '=; Max-Age=0; path=/; domain=.' + location.hostname.replace(/^www\./, '');
          }
        });
      } catch (e) {}
    }
    if (box) { box.remove(); box = null; }
  }

  function banner() {
    if (box) return;
    box = document.createElement('div');
    box.className = 'sy-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Згода на аналітику');
    box.innerHTML =
      '<p>Ми хочемо розуміти, які сторінки корисні, і для цього вмикаємо Google Analytics. ' +
      'Без вашої згоди аналітика не працює й аналітичні cookies не встановлюються. ' +
      '<a href="/privacy">Політика конфіденційності</a></p>' +
      '<div><button type="button" class="ok">Прийняти</button>' +
      '<button type="button" class="no">Лише необхідні</button></div>';
    box.querySelector('.ok').addEventListener('click', function () { decide(true); });
    box.querySelector('.no').addEventListener('click', function () { decide(false); });
    document.body.appendChild(box);
  }

  // дозволяємо змінити вибір: <a href="#cookies"> або [data-cookies]
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-cookies], a[href="#cookies"]') : null;
    if (!t) return;
    e.preventDefault();
    banner();
  });

  function start() {
    var saved = read();
    if (saved === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      load();
      return;
    }
    if (saved === 'denied') return;
    setTimeout(banner, 1200);   // не перекриваємо перший екран
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
