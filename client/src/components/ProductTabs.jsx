import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const tabs = [
    { id: 'moysklad', name: 'Мой Склад' },
    { id: 'ozon', name: 'Озон' },
    { id: 'wb', name: 'Вайлдбериз' },
    { id: 'yandex', name: 'Яндекс Маркет' }
  ]

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
      
      // Загружаем все данные порциями по 1000, чтобы обойти лимит Supabase
      let allData = []
      let from = 0
      const chunkSize = 1000
      
      while (true) {
        const { data: chunk, error: chunkError } = await supabase
          .from(tableName)
          .select('*')
          .range(from, from + chunkSize - 1)
        
        if (chunkError) {
          throw new Error(`${tableName}: ${chunkError.message}`)
        }
        
        if (!chunk || chunk.length === 0) {
          break
        }
        
        allData = [...allData, ...chunk]
        
        // Если получили меньше чем chunkSize, значит это последняя порция
        if (chunk.length < chunkSize) {
          break
        }
        
        from += chunkSize
      }
      
      setData(allData)
    } catch (err) {
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

  return (
    <div className="max-w-full overflow-auto">
      <div className="mb-6 space-y-4">
        {/* Вкладки */}
        <div className="flex justify-center gap-2">
          {tabs.map((tab) => {
            const getTabStyles = (tabId) => {
              const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-opacity'
              const gradients = {
                moysklad: 'bg-gradient-to-r from-[#00B2FF] to-[#009EE3] text-white',
                ozon: 'bg-gradient-to-r from-[#005BFF] to-[#338EFF] text-white',
                wb: 'bg-gradient-to-r from-[#A72974] to-[#D91A94] text-white',
                yandex: 'bg-gradient-to-r from-[#FFCC00] to-[#FF9900] text-black'
              }
              
              const opacity = activeTab === tabId ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              return `${baseClasses} ${gradients[tabId]} ${opacity}`
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={getTabStyles(tab.id)}
              >
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Содержимое */}
      <div className="mt-4 space-y-4">
        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <div className="text-gray-600 mt-4 font-medium">Загрузка данных...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500 font-bold">⚠</span>
              </div>
              <div className="ml-3">
                <strong>Ошибка:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-lg font-medium">Нет данных для отображения</div>
            </div>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full table-auto border border-gray-300">
              <thead>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="px-2 py-1 border bg-gray-100 text-xs text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.entries(item).map(([key, value], j) => {
                      // Проверяем если это поле с изображением
                      const isImageField = key.toLowerCase().includes('image') || 
                                         key.toLowerCase().includes('photo') || 
                                         key.toLowerCase().includes('picture')
                      
                      // Проверяем если это поле со ссылкой
                      const isLinkField = key.toLowerCase().includes('link') || 
                                        key.toLowerCase().includes('url')
                      
                      if (isImageField && value) {
                        return (
                          <td key={j} className="px-2 py-1 border text-xs">
                            <img 
                              src={value}
                              alt="Товар"
                              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => window.open(value, '_blank')}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentNode.innerHTML = '<button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Открыть</button>'
                                e.target.parentNode.onclick = () => window.open(value, '_blank')
                              }}
                            />
                          </td>
                        )
                      }
                      
                      if (isLinkField && value) {
                        return (
                          <td key={j} className="px-2 py-1 border text-xs">
                            <button 
                              onClick={() => window.open(value, '_blank')}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Открыть
                            </button>
                          </td>
                        )
                      }
                      
                      return (
                        <td key={j} className="px-2 py-1 border text-xs truncate max-w-[150px]" title={String(value)}>
                          {String(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}