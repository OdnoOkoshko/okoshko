# Okoshko - Основные файлы проекта

## Содержимое папки:

### Фронтенд (client-src/)
- `App.jsx` - главный компонент приложения
- `main.jsx` - точка входа
- `index.css` - стили с TailwindCSS
- `components/` - все React компоненты
- `hooks/` - кастомные хуки
- `shared/` - общие утилиты и хуки
- `config/` - конфигурации
- `utils/` - утилиты
- `lib/` - интеграции (Supabase)

### Сервер (server/)
- `index.ts` - Express сервер
- `routes.ts` - API роуты
- `storage.ts` - интерфейс хранения данных
- `vite.ts` - интеграция с Vite
- `shared/` - общие схемы данных

### Конфигурационные файлы:
- `package.json` - зависимости проекта
- `tsconfig.json` - настройки TypeScript
- `vite.config.ts` - настройки Vite
- `tailwind.config.js` - настройки TailwindCSS
- `postcss.config.js` - настройки PostCSS
- `drizzle.config.ts` - настройки Drizzle ORM
- `replit.md` - документация проекта и архитектуры

### Установка:
1. `npm install` - установить зависимости
2. `npm run dev` - запустить сервер разработки
3. Настроить переменные окружения для Supabase

### Размер архива: ~50KB (без node_modules)
### Полный проект с зависимостями: ~200MB