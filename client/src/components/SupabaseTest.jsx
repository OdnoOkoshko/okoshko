import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseTest() {
  const [connected, setConnected] = useState(false)
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setLoading(true)
      
      // Проверяем подключение
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(10)

      if (error) {
        console.error('Supabase connection error:', error)
        setError(error.message)
        setConnected(false)
      } else {
        setConnected(true)
        setTables(data || [])
        console.log('Supabase подключен! Таблицы:', data)
      }
    } catch (err) {
      console.error('Connection test failed:', err)
      setError(err.message)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const testQueries = async () => {
    try {
      // Попробуем разные запросы для изучения структуры
      const queries = [
        { name: 'Все таблицы', query: supabase.from('information_schema.tables').select('*').eq('table_schema', 'public') },
        { name: 'Колонки таблиц', query: supabase.from('information_schema.columns').select('*').eq('table_schema', 'public').limit(20) }
      ]

      for (const { name, query } of queries) {
        const { data, error } = await query
        if (!error) {
          console.log(`${name}:`, data)
        }
      }
    } catch (err) {
      console.error('Test queries failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Подключение к Supabase</h2>
      
      <div className="mb-4">
        <div className={`flex items-center gap-2 ${connected ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {connected ? 'Подключено успешно' : 'Ошибка подключения'}
          </span>
        </div>
        
        {error && (
          <p className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
      </div>

      {connected && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Найденные таблицы:</h3>
            {tables.length > 0 ? (
              <ul className="list-disc list-inside bg-gray-50 p-3 rounded">
                {tables.map((table, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {table.table_name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Публичные таблицы не найдены</p>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={checkConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              Обновить
            </button>
            <button 
              onClick={testQueries}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            >
              Показать структуру в консоли
            </button>
          </div>
        </div>
      )}
    </div>
  )
}