import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Маппинг вкладок к таблицам
  const tableMapping = {
    moysklad: 'products_moysklad',
    ozon: 'products_ozon', 
    wb: 'products_wb',
    yandex: 'products_yandex'
  }

  // Загрузка данных из Supabase
  const loadData = async (tab) => {
    setLoading(true)
    setError(null)
    
    try {
      const tableName = tableMapping[tab]
      console.log(`Загружаем данные из таблицы: ${tableName}`)
      
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(50)
      
      console.log('Результат запроса:', { tableData, tableError })
      
      if (tableError) {
        console.error('Ошибка Supabase:', tableError)
        throw new Error(`${tableName}: ${tableError.message} (${tableError.code})`)
      }
      
      setData(tableData || [])
      console.log(`Загружено записей: ${tableData?.length || 0}`)
    } catch (err) {
      console.error('Полная ошибка:', err)
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Загрузка данных при изменении активной вкладки
  useEffect(() => {
    loadData(activeTab)
  }, [activeTab])

  const tabs = [
    { id: 'moysklad', name: 'МойСклад' },
    { id: 'ozon', name: 'Ozon' },
    { id: 'wb', name: 'WB' },
    { id: 'yandex', name: 'Яндекс' }
  ]

  // Получение колонок из первой записи данных
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  // Тест подключения к Supabase
  const testConnection = async () => {
    try {
      console.log('=== ДИАГНОСТИКА SUPABASE ===')
      const url = import.meta.env.VITE_SUPABASE_URL
      console.log('URL:', url)
      console.log('Key длина:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length)
      
      // Проверим доступность базового URL
      try {
        const response = await fetch(url)
        console.log('Базовый URL доступен:', response.status)
      } catch (fetchError) {
        console.error('URL недоступен:', fetchError.message)
        setError('Supabase URL недоступен. Проверьте правильность URL в настройках проекта.')
        return
      }
      
      const { data: session, error } = await supabase.auth.getSession()
      console.log('Сессия:', session, 'Ошибка:', error)
      
      // Проверим доступность таблицы простым запросом
      const { data, error: testError } = await supabase
        .from('products_moysklad')
        .select('count')
        .limit(1)
      
      console.log('Тест таблицы products_moysklad:', { data, testError })
    } catch (err) {
      console.error('Ошибка теста:', err)
    }
  }

  return (
    <div className="w-full">
      {/* Вкладки */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={testConnection}
            className="py-2 px-3 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Тест
          </button>
        </nav>
      </div>

      {/* Таблица */}
      <div className="mt-6">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Загрузка данных...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет данных для отображения
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}