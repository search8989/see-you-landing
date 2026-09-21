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
  var CITIES = window.SY_CITIES || { ua: [], eu: [], as: [], af: [], na: [], sa: [], oc: [] };

  var VIEW = {
    ua: { center: [48.6, 31.2], zoom: 5 },
    eu: { center: [52.0, 15.0], zoom: 4 },
    as: { center: [34.0, 80.0], zoom: 3 },
    af: { center: [2.0, 20.0], zoom: 3 },
    na: { center: [43.0, -100.0], zoom: 3 },
    sa: { center: [-15.0, -60.0], zoom: 3 },
    oc: { center: [-25.0, 140.0], zoom: 3 }
  };


  /* Координати міст. Бекенд віддає лише назву міста, країну й кількість
     виконавців — координати тримаємо тут, щоб у базі не зберігалося
     нічого зайвого про людей. Міста, якого немає у словнику, не зникне:
     воно потрапить у підпис під картою. */
  var GEO = {
    'київ': [50.4501, 30.5234], 'львів': [49.8397, 24.0297], 'харків': [49.9935, 36.2304],
    'одеса': [46.4825, 30.7233], 'дніпро': [48.4647, 35.0462], 'запоріжжя': [47.8388, 35.1396],
    'вінниця': [49.2331, 28.4682], 'полтава': [49.5883, 34.5514], 'чернігів': [51.4982, 31.2893],
    'черкаси': [49.4444, 32.0598], 'суми': [50.9077, 34.7981], 'житомир': [50.2547, 28.6587],
    'хмельницький': [49.4229, 26.9871], 'рівне': [50.6199, 26.2516], 'луцьк': [50.7472, 25.3254],
    'тернопіль': [49.5535, 25.5948], 'івано-франківськ': [48.9226, 24.7111],
    'ужгород': [48.6208, 22.2879], 'чернівці': [48.2921, 25.9358], 'миколаїв': [46.9750, 31.9946],
    'херсон': [46.6354, 32.6169], 'кропивницький': [48.5079, 32.2623],
    'кривий ріг': [47.9105, 33.3918], 'бровари': [50.5110, 30.7900], 'ірпінь': [50.5218, 30.2506],
    'біла церква': [49.7950, 30.1310], 'дрогобич': [49.3497, 23.5049],
    'мукачево': [48.4414, 22.7179], 'коломия': [48.5313, 25.0364], 'стрий': [49.2619, 23.8567],
    'варшава': [52.2297, 21.0122], 'краків': [50.0647, 19.9450], 'вроцлав': [51.1079, 17.0385],
    'гданськ': [54.3520, 18.6466], 'познань': [52.4064, 16.9252], 'лодзь': [51.7592, 19.4560],
    'берлін': [52.5200, 13.4050], 'гамбург': [53.5511, 9.9937], 'мюнхен': [48.1351, 11.5820],
    'кельн': [50.9375, 6.9603], 'франкфурт': [50.1109, 8.6821], 'дюссельдорф': [51.2277, 6.7735],
    'прага': [50.0755, 14.4378], 'брно': [49.1951, 16.6068], 'братислава': [48.1486, 17.1077],
    'відень': [48.2082, 16.3738], 'будапешт': [47.4979, 19.0402], 'бухарест': [44.4268, 26.1025],
    'софія': [42.6977, 23.3219], 'мадрид': [40.4168, -3.7038], 'барселона': [41.3851, 2.1734],
    'валенсія': [39.4699, -0.3763], 'лісабон': [38.7223, -9.1393], 'порту': [41.1579, -8.6291],
    'рим': [41.9028, 12.4964], 'мілан': [45.4642, 9.1900], 'неаполь': [40.8518, 14.2681],
    'париж': [48.8566, 2.3522], 'лондон': [51.5074, -0.1278], 'амстердам': [52.3676, 4.9041],
    'брюссель': [50.8503, 4.3517], 'стокгольм': [59.3293, 18.0686], 'осло': [59.9139, 10.7522],
    'копенгаген': [55.6761, 12.5683], 'гельсінкі': [60.1699, 24.9384], 'таллінн': [59.4370, 24.7536],
    'рига': [56.9496, 24.1052], 'вільнюс': [54.6872, 25.2797], 'кишинів': [47.0105, 28.8638],
    'тбілісі': [41.7151, 44.8271], 'стамбул': [41.0082, 28.9784], 'анталія': [36.8969, 30.7133],
    'дубай': [25.2048, 55.2708], 'тель-авів': [32.0853, 34.7818], 'бангкок': [13.7563, 100.5018],
    'токіо': [35.6762, 139.6503], 'сеул': [37.5665, 126.9780], 'нью-йорк': [40.7128, -74.0060],
    'торонто': [43.6532, -79.3832]
  };

  var BY_REGION = {
    eu: ['польща','німеччина','чехія','словаччина','австрія','угорщина','румунія','болгарія',
         'іспанія','португалія','італія','франція','велика британія','нідерланди','бельгія',
         'швеція','норвегія','данія','фінляндія','естонія','латвія','литва','молдова','ірландія',
         'швейцарія','греція','хорватія','словенія','сербія','чорногорія','боснія і герцеговина',
         'албанія','північна македонія','косово','ісландія','люксембург','мальта','кіпр'],
    as: ['туреччина','грузія','вірменія','азербайджан','оае','ізраїль','йорданія','катар',
         'саудівська аравія','таїланд','японія','південна корея','китай','індія','індонезія',
         'вʼєтнам','малайзія','сінгапур','філіппіни','узбекистан','казахстан','бангладеш'],
    af: ['єгипет','марокко','туніс','алжир','південна африка','кенія','нігерія','гана','ефіопія'],
    na: ['сша','канада','мексика','панама','коста-рика','куба','домініканська республіка'],
    sa: ['бразилія','аргентина','чилі','колумбія','перу','уругвай','парагвай','еквадор','болівія'],
    oc: ['австралія','нова зеландія','фіджі']
  };

  function regionOf(country) {
    var c = (country || '').trim().toLowerCase();
    if (!c || c === 'україна') return 'ua';
    for (var key in BY_REGION) {
      if (BY_REGION[key].indexOf(c) > -1) return key;
    }
    return '';     // невідома країна — не вгадуємо регіон, місто піде у примітку
  }

  /* Зведення з бекенда: у яких містах уже є підтверджені виконавці.
     Сайт нічого не знає про самих людей — лише «місто + скільки». */
  function fetchCoverage() {
    return fetch('https://api.see-you.app/public/coverage', { mode: 'cors' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.cities) return null;
        var out = { ua: [], eu: [], as: [], af: [], na: [], sa: [], oc: [] }, unknown = [];
        d.cities.forEach(function (c) {
          var pt = GEO[(c.city || '').trim().toLowerCase()];
          var rg = regionOf(c.country);
          if (pt && rg) out[rg].push({ name: c.city, lat: pt[0], lon: pt[1], count: c.count });
          else if (c.city) unknown.push(c.city);
        });
        out._unknown = unknown;
        return out;
      })
      .catch(function () { return null; });
  }

  var map = null, layer = null, loading = false, failed = false;

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
      }).addTo(layer).bindTooltip(c.count ? c.name + ' \u2014 ' + c.count : c.name, { direction: 'top' });
    });

    if (empty) empty.hidden = failed ? false : list.length > 0;
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

  function start() {
    fetchCoverage().then(function (data) {
      if (data) {
        CITIES = data;
        var un = data._unknown || [];
        if (un.length && empty && empty.parentNode) {
          var note = document.createElement('p');
          note.className = 'map-note';
          note.textContent = 'Також є виконавці: ' + un.join(', ');
          empty.parentNode.appendChild(note);
        }
      }
      else if (empty) {
        // Дані не завантажились: це не «виконавців немає», а збій —
        // кажемо про нього прямо й не показуємо порожній регіон як факт.
        empty.textContent = 'Не вдалося оновити дані карти. Оновіть сторінку трохи згодом.';
        failed = true;
      }
      select('ua');
    });
  }

  // Карту й дані підвантажуємо лише коли блок доїхав до екрана —
  // сторінка не має тягнути сторонні скрипти заради того, чого не видно.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        start();
      }
    }, { rootMargin: '200px' });
    io.observe(box);
  } else {
    start();
  }
})();
