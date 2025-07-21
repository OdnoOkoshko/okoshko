import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseStatus() {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    tables: [],
    error: null
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))
      
      // Тест подключения через auth
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Ошибка авторизации: ${sessionError.message}`)
      }

      // Проверяем доступные таблицы
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public')
        .limit(10)

      setStatus({
        connected: true,
        loading: false,
        tables: tablesData || [],
        error: null
      })

      console.log('✅ Supabase подключен успешно')
      console.log('📊 Найдено таблиц:', tablesData?.length || 0)
      
    } catch (err) {
      setStatus({
        connected: false,
        loading: false,
        tables: [],
        error: err.message
      })
      console.error('❌ Ошибка подключения к Supabase:', err)
    }
  }

  const createTestTable = async () => {
    try {
      // Создаем тестовую таблицу для заказов
      const { data, error } = await supabase.rpc('create_orders_table', {})
      
      if (error) {
        console.log('Не удалось создать таблицу через RPC, это нормально')
      }
      
      // Обновляем список таблиц
      testConnection()
    } catch (err) {
      console.log('Тестовая таблица не создана:', err.message)
    }
  }

  if (status.loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-800">Подключаемся к Supabase...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${status.connected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`font-medium ${status.connected ? 'text-green-800' : 'text-red-800'}`}>
            Supabase {status.connected ? 'подключен' : 'не подключен'}
          </span>
        </div>
        
        <button 
          onClick={testConnection}
          className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50"
        >
          Обновить
        </button>
      </div>

      {status.error && (
        <div className="text-red-700 text-sm mb-3 bg-red-100 p-2 rounded">
          {status.error}
        </div>
      )}

      {status.connected && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Таблиц в базе: {status.tables.length}
            </span>
            {status.tables.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {status.tables.map((table, i) => (
                  <span key={i} className="inline-block bg-gray-200 rounded px-2 py-1 mr-2 mb-1">
                    {table.table_name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={createTestTable}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Создать тестовую таблицу
            </button>
          </div>
        </div>
      )}
    </div>
  )
}