/* Карта покриття на сторінці «Де працює».

   Свідомі рішення:
   • Leaflet і плитки OpenStreetMap підвантажуються ЛИШЕ коли людина
     відкриває вкладку регіону, а не при завантаженні сторінки. Доки
     карту не відкрили, жодного запиту на сторонній сервер не йде.
   • Міста беремо з window.SY_CITIES. Порожній список — чесно пишемо,
     що виконавців тут поки немає, і пропонуємо стати першим.
*/
(function () {
  var box = document.getElementById('syMap');
  if (!box) return;

  var empty = document.getElementById('mapEmpty');
  var tabs = [].slice.call(document.querySelectorAll('.region-tab'));
  var CITIES = window.SY_CITIES || { ua: [], eu: [], as: [] };

  var VIEW = {
    ua: { center: [48.6, 31.2], zoom: 5 },
    eu: { center: [52.0, 15.0], zoom: 4 },
    as: { center: [34.0, 80.0], zoom: 3 }
  };

  var map = null, layer = null, loading = false;

  function load(cb) {
    if (window.L) return cb();
    if (loading) return;
    loading = true;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    var js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = function () { loading = false; cb(); };
    js.onerror = function () { loading = false; box.classList.add('map-failed'); };
    document.head.appendChild(js);
  }

  function draw(region) {
    var view = VIEW[region] || VIEW.ua;
    var list = CITIES[region] || [];

    if (!map) {
      map = L.map(box, { scrollWheelZoom: false, attributionControl: true });
      // Плитки OpenStreetMap світлі, тому темний вигляд робимо фільтром
      // у CSS — так не потрібен ні ключ, ні платний постачальник.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 12,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
    }
    map.setView(view.center, view.zoom);

    if (layer) map.removeLayer(layer);
    layer = L.layerGroup().addTo(map);

    list.forEach(function (c) {
      L.circleMarker([c.lat, c.lon], {
        radius: 7,
        color: '#E45858',
        weight: 2,
        fillColor: '#E45858',
        fillOpacity: .85
      }).addTo(layer).bindTooltip(c.name, { direction: 'top' });
    });

    if (empty) empty.hidden = list.length > 0;
    setTimeout(function () { map.invalidateSize(); }, 60);
  }

  function select(region) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-region') === region;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    load(function () { draw(region); });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { select(t.getAttribute('data-region')); });
  });

  // Першу карту малюємо лише коли блок доїхав до екрана —
  // сторінка не має тягнути сторонні скрипти заради того, чого не видно.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        select('ua');
      }
    }, { rootMargin: '200px' });
    io.observe(box);
  } else {
    select('ua');
  }
})();
