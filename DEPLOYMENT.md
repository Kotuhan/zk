# Деплой на GitHub Pages

## Налаштування

### 1. Додайте секрети в GitHub

Перейдіть в Settings → Secrets and variables → Actions та додайте:

- `VITE_SUPABASE_URL` - ваш Supabase URL
- `VITE_SUPABASE_ANON_KEY` - ваш Supabase anon key

### 2. Увімкніть GitHub Pages

1. Перейдіть в Settings → Pages
2. Source: виберіть "GitHub Actions"

### 3. Закомітьте зміни

```bash
git add .
git commit -m "setup github pages deployment"
git push origin main
```

### 4. Деплой відбудеться автоматично

Після push в main, GitHub Actions автоматично побудує та задеплоїть сайт.

Ваш сайт буде доступний за адресою: `https://[ваш-username].github.io/zk/`

## Локальна перевірка продакшн білду

```bash
npm run build
npm run preview
```

## Примітки

- `.env` файл НЕ комітиться в git (перевірте `.gitignore`)
- Використовуйте `.env.example` як шаблон
- Секрети додаються через GitHub Settings → Secrets
- Base URL налаштований як `/zk/` в `vite.config.ts`
