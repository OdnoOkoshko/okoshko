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

      // Проверяем доступные таблицы разными способами
      let tablesData = []
      
      // Способ 1: через information_schema
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.tables')
          .select('table_name, table_schema')
          .limit(20)
        
        if (!schemaError && schemaData) {
          tablesData = schemaData
          console.log('📋 Все таблицы в базе:', schemaData)
        }
      } catch (err) {
        console.log('Не удалось получить через information_schema:', err)
      }
      
      // Способ 2: через pg_tables (если первый не работает)
      if (tablesData.length === 0) {
        try {
          const { data: pgData, error: pgError } = await supabase
            .from('pg_tables')
            .select('tablename, schemaname')
            .limit(20)
          
          if (!pgError && pgData) {
            tablesData = pgData.map(t => ({ 
              table_name: t.tablename, 
              table_schema: t.schemaname 
            }))
            console.log('📋 Таблицы через pg_tables:', pgData)
          }
        } catch (err) {
          console.log('Не удалось получить через pg_tables:', err)
        }
      }
      
      // Способ 3: проверяем распространенные таблицы напрямую
      if (tablesData.length === 0) {
        console.log('🔍 Проверяем существующие таблицы напрямую...')
        const foundTables = await testExistingTables()
        if (foundTables.length > 0) {
          tablesData = foundTables.map(name => ({ table_name: name, table_schema: 'public' }))
        }
      }

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

  const testExistingTables = async () => {
    console.log('🔍 Проверяем существующие таблицы...')
    
    // Список возможных таблиц для проверки
    const tablesToTest = [
      'products_moysklad', // таблица пользователя
      'orders', 'products', 'users', 'categories', 'marketplace_orders',
      'order_items', 'customers', 'items', 'inventory', 'suppliers'
    ]
    const existingTables = []
    
    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error) {
          existingTables.push(tableName)
          console.log(`✅ Таблица ${tableName} найдена (записей: ${data?.length || 0})`)
        } else if (error.code === 'PGRST116') {
          // Таблица существует, но нет данных - это тоже успех
          existingTables.push(tableName)
          console.log(`✅ Таблица ${tableName} найдена (пустая)`)
        }
      } catch (err) {
        console.log(`❌ Таблица ${tableName} не найдена`)
      }
    }
    
    if (existingTables.length > 0) {
      console.log('🎉 Найдены таблицы:', existingTables)
      setStatus(prev => ({ 
        ...prev, 
        tables: existingTables.map(name => ({ table_name: name, table_schema: 'public' }))
      }))
    } else {
      console.log('ℹ️ Возможно таблицы существуют, но недоступны через API')
    }
    
    return existingTables
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
          
          <div className="flex space-x-2 flex-wrap">
            <button 
              onClick={testExistingTables}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Найти таблицы
            </button>
            <button 
              onClick={async () => {
                console.log('🔍 Тестируем products_moysklad...')
                try {
                  const { data, error } = await supabase
                    .from('products_moysklad')
                    .select('*')
                    .limit(5)
                  
                  if (!error) {
                    console.log('✅ products_moysklad работает! Данные:', data)
                    setStatus(prev => ({ 
                      ...prev, 
                      tables: [{ table_name: 'products_moysklad', table_schema: 'public' }]
                    }))
                  } else {
                    console.log('❌ Ошибка доступа к products_moysklad:', error)
                  }
                } catch (err) {
                  console.log('❌ Ошибка:', err)
                }
              }}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Тест products_moysklad
            </button>
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