# Інструкція з налаштування Supabase

## 1. Створення проекту в Supabase

1. Перейдіть на https://supabase.com
2. Натисніть "Start your project"
3. Створіть новий проект (або виберіть існуючий)
4. Дочекайтеся завершення налаштування (1-2 хвилини)

## 2. Отримання API ключів

1. В панелі Supabase перейдіть до **Settings** → **API**
2. Скопіюйте:
   - **Project URL** (щось на кшталт `https://xxxxx.supabase.co`)
   - **anon public** ключ (починається з `eyJ...`)

## 3. Налаштування змінних оточення

1. Відкрийте файл `.env` в корені проекту
2. Вставте ваші ключі:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Створення таблиці в базі даних

1. В Supabase перейдіть до **SQL Editor**
2. Натисніть **New query**
3. Скопіюйте весь вміст файлу `supabase-schema.sql`
4. Вставте в редактор і натисніть **Run** (або F5)

Це створить:
- Таблицю `projects`
- Індекси для швидкого пошуку
- Row Level Security політики
- Тригер для автоматичного оновлення дати

## 5. Налаштування авторизації (опціонально)

### Email підтвердження:

За замовчуванням Supabase вимагає підтвердження email. Щоб вимкнути для розробки:

1. **Authentication** → **Settings**
2. Знайдіть "Enable email confirmations"
3. Вимкніть (toggle off)

### Тестування локально:

Ви можете використовувати тестові email'и:
- `test@example.com`
- `user@test.com`

## 6. Перезапуск dev сервера

```bash
npm run dev
```

## 7. Тестування

1. Відкрийте http://localhost:5173
2. Створіть акаунт або увійдіть
3. Створіть проект - він збережеться в Supabase!
4. Перевірте в Supabase Dashboard → **Table Editor** → `projects`

## Troubleshooting

### Помилка "Invalid API key"
- Перевірте чи правильно скопійовані ключі в `.env`
- Перезапустіть dev сервер після зміни `.env`

### Помилка "Row Level Security"
- Переконайтеся що виконали SQL скрипт `supabase-schema.sql`
- Перевірте що ви авторизовані

### Проекти не завантажуються
- Відкрийте консоль браузера (F12)
- Перевірте чи є помилки
- Можливо потрібно очистити localStorage: `localStorage.clear()`

## Додаткові можливості

### Real-time синхронізація (майбутнє)
Можна додати автоматичне оновлення при змінах з інших пристроїв:

```typescript
supabase
  .channel('projects')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'projects' },
    (payload) => {
      // Оновити список проектів
    }
  )
  .subscribe();
```

### Міграція даних з localStorage
Додайте функцію для перенесення існуючих проектів:

```typescript
const migrateToSupabase = async () => {
  const local = localStorage.getItem('zk-projects');
  if (local && user) {
    const projects = JSON.parse(local);
    // Завантажити в Supabase...
  }
};
```
