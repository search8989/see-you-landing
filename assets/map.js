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
    eu: { center: [50.0, 20.0], zoom: 4 },
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
    'рига': [56.9496, 24.1052], 'вільнюс': [54.6872, 25.2797], 'кишинів': [47.0105, 28.8638], 'тенеріфе': [28.2916, -16.6291],
    'тбілісі': [41.7151, 44.8271], 'стамбул': [41.0082, 28.9784], 'анталія': [36.8969, 30.7133],
    'дубай': [25.2048, 55.2708], 'тель-авів': [32.0853, 34.7818], 'бангкок': [13.7563, 100.5018],
    'токіо': [35.6762, 139.6503], 'сеул': [37.5665, 126.9780], 'нью-йорк': [40.7128, -74.0060],
    'торонто': [43.6532, -79.3832]
  };

  /* Інші написання тих самих міст — латиниця, російська, локальні назви.
     Основне джерело координат — сервер (Google); це запас. */
  var ALIAS = {
    'tenerife': 'тенеріфе', 'тенерифе': 'тенеріфе', 'santa cruz de tenerife': 'тенеріфе',
    'hamburg': 'гамбург', 'köln': 'кельн', 'koln': 'кельн', 'cologne': 'кельн', 'кёльн': 'кельн',
    'berlin': 'берлін', 'munich': 'мюнхен', 'münchen': 'мюнхен', 'frankfurt': 'франкфурт',
    'düsseldorf': 'дюссельдорф', 'dusseldorf': 'дюссельдорф',
    'warsaw': 'варшава', 'warszawa': 'варшава', 'krakow': 'краків', 'kraków': 'краків',
    'wroclaw': 'вроцлав', 'wrocław': 'вроцлав', 'gdansk': 'гданськ', 'gdańsk': 'гданськ',
    'poznan': 'познань', 'poznań': 'познань', 'lodz': 'лодзь', 'łódź': 'лодзь',
    'prague': 'прага', 'praha': 'прага', 'vienna': 'відень', 'wien': 'відень',
    'budapest': 'будапешт', 'bucharest': 'бухарест', 'sofia': 'софія',
    'madrid': 'мадрид', 'barcelona': 'барселона', 'valencia': 'валенсія',
    'lisbon': 'лісабон', 'lisboa': 'лісабон', 'porto': 'порту', 'rome': 'рим', 'roma': 'рим',
    'milan': 'мілан', 'milano': 'мілан', 'paris': 'париж', 'london': 'лондон',
    'amsterdam': 'амстердам', 'brussels': 'брюссель', 'tallinn': 'таллінн', 'riga': 'рига',
    'vilnius': 'вільнюс', 'chisinau': 'кишинів', 'chișinău': 'кишинів', 'tbilisi': 'тбілісі',
    'istanbul': 'стамбул', 'dubai': 'дубай', 'new york': 'нью-йорк', 'toronto': 'торонто',
    'kyiv': 'київ', 'kiev': 'київ', 'lviv': 'львів', 'odesa': 'одеса', 'odessa': 'одеса',
    'kharkiv': 'харків', 'dnipro': 'дніпро'
  };
  function geoOf(city) {
    var c = (city || '').trim().toLowerCase();
    return GEO[c] || GEO[ALIAS[c]] || null;
  }

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
    if (!c || c === 'україна') return 'eu';
    for (var key in BY_REGION) {
      if (BY_REGION[key].indexOf(c) > -1) return key;
    }
    // Одруківки («Німечиина»): збіг перших 5 літер із відомою країною.
    var head = c.slice(0, 5);
    for (var k2 in BY_REGION) {
      for (var i = 0; i < BY_REGION[k2].length; i++) {
        if (BY_REGION[k2][i].slice(0, 5) === head) return k2;
      }
    }
    var LAT = { germany: 'eu', deutschland: 'eu', spain: 'eu', españa: 'eu', poland: 'eu', polska: 'eu',
      italy: 'eu', france: 'eu', usa: 'na', 'united states': 'na', canada: 'na', turkey: 'as', türkiye: 'as' };
    return LAT[c] || '';     // невідома країна — не вгадуємо регіон, місто піде у примітку
  }

  /* Регіон за ISO-кодом країни від сервера (Google Geocoding): не залежить
     від того, як людина написала країну в профілі. */
  var CODE_REGION = {
    UA: 'eu',
    AL:'eu',AD:'eu',AT:'eu',BA:'eu',BE:'eu',BG:'eu',BY:'eu',CH:'eu',CY:'eu',CZ:'eu',DE:'eu',DK:'eu',EE:'eu',ES:'eu',FI:'eu',FR:'eu',GB:'eu',GR:'eu',HR:'eu',HU:'eu',IE:'eu',IS:'eu',IT:'eu',LI:'eu',LT:'eu',LU:'eu',LV:'eu',MC:'eu',MD:'eu',ME:'eu',MK:'eu',MT:'eu',NL:'eu',NO:'eu',PL:'eu',PT:'eu',RO:'eu',RS:'eu',SE:'eu',SI:'eu',SK:'eu',SM:'eu',XK:'eu',
    TR:'as',GE:'as',AM:'as',AZ:'as',AE:'as',IL:'as',JO:'as',QA:'as',SA:'as',TH:'as',JP:'as',KR:'as',CN:'as',IN:'as',ID:'as',VN:'as',MY:'as',SG:'as',PH:'as',UZ:'as',KZ:'as',BD:'as',KG:'as',TJ:'as',LK:'as',NP:'as',PK:'as',IQ:'as',IR:'as',LB:'as',OM:'as',KW:'as',BH:'as',TW:'as',HK:'as',MN:'as',
    EG:'af',MA:'af',TN:'af',DZ:'af',ZA:'af',KE:'af',NG:'af',GH:'af',ET:'af',TZ:'af',SN:'af',
    US:'na',CA:'na',MX:'na',PA:'na',CR:'na',CU:'na',DO:'na',GT:'na',HN:'na',JM:'na',
    BR:'sa',AR:'sa',CL:'sa',CO:'sa',PE:'sa',UY:'sa',PY:'sa',EC:'sa',BO:'sa',VE:'sa',
    AU:'oc',NZ:'oc',FJ:'oc'
  };

  /* Зведення з бекенда: у яких містах уже є підтверджені виконавці.
     Сайт нічого не знає про самих людей — лише «місто + скільки». */
  function fetchCoverage() {
    return fetch('https://api.see-you.app/public/coverage', { mode: 'cors' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.cities) return null;
        var out = { ua: [], eu: [], as: [], af: [], na: [], sa: [], oc: [] }, unknown = [];
        d.cities.forEach(function (c) {
          // Спершу координати й код країни від сервера; словник — запас,
          // якщо геокодування недоступне.
          var pt = (typeof c.lat === 'number' && typeof c.lon === 'number')
            ? [c.lat, c.lon] : GEO[(c.city || '').trim().toLowerCase()];
          var rg = (c.country_code && CODE_REGION[String(c.country_code).toUpperCase()]) || regionOf(c.country);
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

  /* Країна-агресор і окупований Крим: росія — суцільний червоний,
     Крим — червона штриховка з підписом. Контури з Natural Earth (110m),
     Крим із полігона росії вирізано і збережено окремо. */
  var overlaysDone = false;
  function drawOverlays() {
    if (overlaysDone || !map) return;
    overlaysDone = true;
    fetch('/assets/ru.geo.json').then(function (r) { return r.json(); }).then(function (gj) {
      L.geoJSON(gj, { style: { color: '#B3261E', weight: 1, fillColor: '#B3261E', fillOpacity: .38 }, interactive: false }).addTo(map);
    }).catch(function () {});
    fetch('/assets/crimea.geo.json').then(function (r) { return r.json(); }).then(function (gj) {
      L.geoJSON(gj, { style: { color: '#B3261E', weight: 1.5, dashArray: '4 3', fillColor: '#B3261E', fillOpacity: .18 } })
        .bindTooltip('Крим — тимчасово окупована територія України', { sticky: true }).addTo(map);
    }).catch(function () {});
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
    drawOverlays();

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
      }
      else if (empty) {
        // Дані не завантажились: це не «виконавців немає», а збій —
        // кажемо про нього прямо й не показуємо порожній регіон як факт.
        empty.textContent = 'Не вдалося оновити дані карти. Оновіть сторінку трохи згодом.';
        failed = true;
      }
      select('eu');
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
