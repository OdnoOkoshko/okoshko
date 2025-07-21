import SupabaseStatus from './components/SupabaseStatus'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Okoshko - Единое окно заказов</h1>
        
        <div className="space-y-6">
          <SupabaseStatus />
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Статус системы</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm font-medium">Фронтенд</div>
                <div className="text-xs text-gray-500">React + Vite</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm font-medium">База данных</div>
                <div className="text-xs text-gray-500">Supabase</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">⏳</div>
                <div className="text-sm font-medium">Интеграции</div>
                <div className="text-xs text-gray-500">N8N (внешний)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Готов к разработке</h2>
            <p className="text-gray-600 mb-4">
              Система настроена и готова для создания интерфейса управления заказами с маркетплейсов.
            </p>
            <div className="text-sm text-gray-500">
              Следующий шаг: создание компонентов для работы с заказами
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
