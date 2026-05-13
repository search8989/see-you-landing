# SEE YOU — Landing

Лендинг сервісу SEE YOU. Статичний HTML/CSS без бекенду, без JS-фреймворків.

## Структура

```
landing/
├── index.html          # Головна (hero, як працює, категорії, безпека, FAQ, контакти)
├── terms.html          # Умови користування
├── privacy.html        # Політика конфіденційності
├── about.html          # Про сервіс
├── contacts.html       # Контакти + ФОП-реквізити
├── assets/
│   └── style.css       # Спільні стилі для всіх сторінок
└── README.md           # Цей файл
```

## Локальний перегляд

Відкрий `index.html` подвійним кліком — Chrome або Edge відкриє його напряму.

Або через простий локальний сервер (щоб посилання типу `/terms.html` працювали як на проді):

```powershell
cd C:\шлях\до\see-you-landing
python -m http.server 8000
# Відкрий http://localhost:8000
```

## Деплой на Cloudflare Pages

### Крок 1. Створити GitHub-репо

1. На [github.com/search8989](https://github.com/search8989) → New repository → `see-you-landing` → Private → Create.
2. Локально:
   ```powershell
   cd C:\шлях\до\see-you-landing
   git init
   git add .
   git commit -m "initial commit: landing v1"
   git branch -M main
   git remote add origin https://github.com/search8989/see-you-landing.git
   git push -u origin main
   ```
   Або через GitHub Desktop, якщо звичніше.

### Крок 2. Підключити Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create application → **Pages** → Connect to Git.
2. Авторизувати GitHub (якщо ще не зробив) → обрати `see-you-landing`.
3. **Build settings:**
   - Framework preset: **None**.
   - Build command: **залиш порожнім** (статичні файли).
   - Build output directory: **`/`** (корінь репо).
4. Save and Deploy. ~30 секунд — і отримаєш URL `see-you-landing.pages.dev`.

### Крок 3. Прив'язати домен `see-you.app`

1. У Cloudflare Pages-проєкті → **Custom domains** → Set up a custom domain.
2. Введи `see-you.app` (без піддомену) → Continue → Activate domain.
3. Cloudflare сам додасть CNAME на root → `see-you-landing.pages.dev` (через CNAME flattening, бо домен на Cloudflare DNS).
4. SSL видається автоматично за 1-5 хв.

> ⚠️ Якщо домен `see-you.app` уже використовується для `api.see-you.app` через CNAME — це не конфлікт. Root і піддомен це різні DNS-записи.

### Крок 4. Перевірка

Через 1-5 хв після Activate domain:

- `https://see-you.app` → відкриває цей лендинг.
- `https://see-you.app/terms.html` → Terms.
- `https://see-you.app/privacy.html` → Privacy.
- Локально:
  ```powershell
  # PowerShell із TLS 1.2 (PS 5.1 за замовчуванням не вміє)
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest https://see-you.app | Select-Object StatusCode
  ```

Якщо у браузері `DNS_PROBE_FINISHED_NXDOMAIN` — DNS ще пропагується (буває до 30 хв). Перевір через `nslookup see-you.app 1.1.1.1`.

## Що варто зробити після першого деплою

### Перед поданням на LiqPay-модерацію

- [ ] Перечитати ToS і Privacy з юристом — це драфти, на проді треба погоджені документи.
- [ ] Додати реальний `hello@see-you.app` як працюючий email (Cloudflare Email Routing → forward на gmail).
- [ ] Додати скріншоти застосунку у секцію «Як працює» — підвищує довіру.
- [ ] Перевірити, що жодне з NBU-стоп-слів («ескроу», «marketplace», «P2P», «aggregator») не вживається. У поточній версії немає.
- [ ] У описі магазину в LiqPay-кабінеті використати ту саму фразу, що на лендингу: «інформаційна платформа з'єднання замовників і виконавців».

### Майбутні покращення

- [ ] Видалити inline-JS (`onclick` на бургер-меню) — винести в окремий файл, дотримуватися CSP.
- [ ] Додати favicon і OG-image як справжні файли, не SVG-data-URI.
- [ ] Додати простий блог або новини проєкту.
- [ ] Підключити Plausible або Cloudflare Web Analytics (анонімна аналітика).
- [ ] Додати EN-версію (на майбутнє, коли вийдеш на діаспору).

## Перевірка стоп-слів (швидкий тест перед деплоєм)

PowerShell:

```powershell
$forbidden = @("ескроу", "marketplace", "P2P", "aggregator", "агрегатор")
foreach ($word in $forbidden) {
  $found = Select-String -Path *.html -Pattern $word
  if ($found) {
    Write-Host "❌ Знайдено '$word' в:" -ForegroundColor Red
    $found
  } else {
    Write-Host "✅ '$word' — немає"
  }
}
```

## Реквізити (для довідки)

- **ФОП:** Мариняк Андрій Володимирович
- **РНОКПП:** 3261605297
- **IBAN:** UA553052990000026008021021364
- **Банк:** АТ КБ «ПриватБанк», МФО 305299
- **Email:** hello@see-you.app
- **Телефон:** +38 (096) 560-88-93
