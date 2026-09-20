/* SEE YOU — рух інтерфейсу.
   Усе працює і без JS: без нього блоки просто видимі одразу. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── поява блоків при прокручуванні ──────────────────────────────
  function reveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // невелика сходинка всередині одного ряду карток
        var sibs = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
        el.style.transitionDelay = Math.min(sibs, 5) * 70 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);

    // запобіжник: контент не має залежати від анімації
    setTimeout(function () {
      var left = document.querySelectorAll('.reveal:not(.in)');
      for (var k = 0; k < left.length; k++) left[k].classList.add('in');
    }, 2500);
  }

  // ── меню: закривати кліком поза ним і по Escape ─────────────────
  function menu() {
    var links = document.getElementById('navLinks');
    if (!links) return;
    document.addEventListener('click', function (e) {
      if (!links.classList.contains('open')) return;
      if (links.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.nav-burger')) return;
      links.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') links.classList.remove('open');
    });
  }

  // ── шапка щільнішає після прокручування ─────────────────────────
  function nav() {
    var n = document.querySelector('.nav');
    if (!n) return;
    var on = false;
    function sync() {
      var need = window.scrollY > 8;
      if (need !== on) { on = need; n.classList.toggle('is-scrolled', need); }
    }
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  // ── лише один відкритий пункт FAQ ───────────────────────────────
  function faq() {
    var all = document.querySelectorAll('.faq details');
    if (all.length < 2) return;
    for (var i = 0; i < all.length; i++) {
      all[i].addEventListener('toggle', function () {
        if (!this.open) return;
        for (var j = 0; j < all.length; j++) if (all[j] !== this) all[j].open = false;
      });
    }
  }

  // ── широкі таблиці отримують горизонтальне прокручування ────────
  function tables() {
    var t = document.querySelectorAll('table');
    for (var i = 0; i < t.length; i++) {
      if (t[i].parentNode && t[i].parentNode.classList.contains('table-wrap')) continue;
      var w = document.createElement('div');
      w.className = 'table-wrap';
      t[i].parentNode.insertBefore(w, t[i]);
      w.appendChild(t[i]);
    }
  }

  // ── банер встановлення показуємо лише після першого екрана ──────
  function pwa() {
    var el = document.getElementById('pwaBanner');
    if (!el) return;
    function sync() {
      var past = window.scrollY > window.innerHeight * 0.85;
      el.classList.toggle('is-on', past && !el.hasAttribute('hidden'));
    }
    window.addEventListener('scroll', sync, { passive: true });
    new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ['hidden'] });
    sync();
  }

  function start() { reveal(); menu(); nav(); faq(); tables(); pwa(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* Карта Google на «Контактах»: вставляємо iframe лише після кліку.
   Так сторінка не звертається до сторонніх серверів без дії людини. */
(function () {
  var box = document.querySelector('[data-map]');
  if (!box) return;
  var btn = box.querySelector('[data-map-load]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var frame = document.createElement('iframe');
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.title = 'SEE YOU на карті Google';
    frame.allowFullscreen = true;
    frame.src = 'https://www.google.com/maps?q=%D0%9B%D1%8C%D0%B2%D1%96%D0%B2&output=embed';
    btn.remove();
    box.classList.add('is-on');
    box.insertBefore(frame, box.firstChild);
  });
})();
