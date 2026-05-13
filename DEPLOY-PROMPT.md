# Промпт для claude.ai (веб-версія) — допомога з деплоєм лендингу

Скопіюй усе нижче і встав у нову розмову на claude.ai.

---

Я Андрій Мариняк, поліграфолог зі Львова. Роблю стартап SEE YOU — сервіс присутності (знайти людину, яка зробить щось поруч з обʼєктом замість тебе).

Спілкуйся українською, чесно, без улесливості. Не пиши «чудово», «прекрасно», «звісно». Якщо я щось роблю не так — скажи прямо.

## Що в мене вже є

- Папка `C:\Users\avmar\see you\landing\` з готовими файлами лендингу:
  - `index.html`, `terms.html`, `privacy.html`, `about.html`, `contacts.html`
  - `assets/style.css`
  - `robots.txt`, `sitemap.xml`, `.gitignore`, `README.md`
- Домен `see-you.app` уже куплений на Cloudflare ($13/рік).
- На Cloudflare DNS уже є CNAME `api` → Railway (для бекенду). Root (`@`) ще не налаштований — тому `see-you.app` повертає `DNS_PROBE_FINISHED_NXDOMAIN`.
- GitHub username: `search8989`. Email для git: `a.v.maryniak@gmail.com`.
- Cloudflare акаунт — той самий, де куплений домен.
- На Railway уже задеплоєний бекенд (це інший проєкт, не чіпаємо).
- Фронт застосунку — на Cloudflare Pages, домен `see-you-frontend.pages.dev`.

## Що треба зробити

Задеплоїти лендинг із локальної папки на Cloudflare Pages і прив'язати до нього root-домен `see-you.app`. Покроково:

1. Створити Private GitHub-репо `see-you-landing` (або через сайт github.com, або через GitHub Desktop — як простіше).
2. Запушити в нього весь вміст папки `C:\Users\avmar\see you\landing\`.
3. На dash.cloudflare.com → Workers & Pages → Create application → Pages → Connect to Git → обрати `see-you-landing`.
4. Build settings: framework None, build command порожній, output `/`.
5. Save and Deploy. Отримаю URL `see-you-landing.pages.dev`.
6. У цьому ж Pages-проєкті → Custom domains → Set up a custom domain → `see-you.app` → Activate.
7. Перевірити що SSL видався і `https://see-you.app` відкриває лендинг.

## Контекст для тебе

- **PowerShell 5.1** на моїй машині. ASCII-only у `.ps1`-скриптах, для TLS треба явно `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`.
- **NBU стоп-слова** — у лендингу немає «ескроу», «marketplace», «P2P», «агрегатор». Лендинг ще потрібен для повторної подачі магазину на LiqPay-модерацію (ПриватБанк відмовив через відсутність сайту).
- **На Cloudflare** є інший Pages-проєкт `see-you-frontend` (це фронт застосунку, не лендинг). Не плутаймо.
- **CNAME `api`** уже існує і має режим **DNS only (сіра хмарка)**, бо Railway сам видає SSL. Для root-домену через Pages — все навпаки, там Cloudflare сам керує SSL.

## Як комунікуємо

Постав одне запитання за раз. Я виконаю крок і відпишу що бачу — текст помилки, скріншот, чи «готово». Не давай 10 кроків одразу — заплутаюся.

Почни з кроку 1: GitHub-репо. Запитай чи я вмію працювати з GitHub Desktop, чи зручніше через git у командному рядку, чи завантажити файли через веб-UI github.com.
