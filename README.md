# Okoshko - Минимальный фронтенд

Сервис единого окна для заказов с маркетплейсов. Полностью переписан в минималистичном стиле.

## Архитектура

- **React** + **Vite** + **TailwindCSS** - минимальный стек
- **Supabase** - база данных и API
- **Простая HTML таблица** - вместо тяжелых грид библиотек
- Только фронтенд, без серверной части

## Запуск

Поскольку серверная часть удалена, запускайте только Vite dev server:

```bash
cd client
npx vite --port 5000 --host 0.0.0.0
```

Или через npm:

```bash
npm install
cd client && npx vite --port 5000 --host 0.0.0.0
```

## Структура проекта

```
client/src/
├── App.jsx              # Главный компонент (13 строк)
├── main.jsx            # Точка входа (5 строк)  
├── index.css           # TailwindCSS
├── lib/
│   └── supabaseClient.js # Подключение к Supabase (5 строк)
└── components/
    ├── Navbar.jsx      # Навигация
    └── ProductTabs.jsx # Таблицы товаров (210 строк)
```

## Размер проекта

- Исходный код: **17MB**
- node_modules: **130MB** 
- Общий размер: **~150MB**

## Зависимости (минимально)

### Dependencies (3):
- `react` - основа интерфейса
- `react-dom` - рендеринг
- `@supabase/supabase-js` - база данных

### DevDependencies:
- `vite` + `@vitejs/plugin-react` - сборка
- `tailwindcss` - стили
- TypeScript поддержка

## Что удалено

- ❌ AG Grid (~34MB зависимостей)
- ❌ Radix UI (~28 компонентов) 
- ❌ Framer Motion, Recharts, React Query
- ❌ Express сервер, Drizzle ORM
- ❌ Passport, Session management
- ❌ Десятки других библиотек

**Результат**: максимально легкий фронтенд для загрузки заказов из Supabase.