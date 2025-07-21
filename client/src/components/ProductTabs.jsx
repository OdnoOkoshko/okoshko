// ProductTabs.jsx - вкладки товаров с таблицами данных для каждого маркетплейса

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 100

  // Маппинг вкладок на таблицы в БД
  const tableMapping = {
    moysklad: 'products_moysklad',
    ozon: 'products_ozon',
    wb: 'products_wb',
    yandex: 'products_yandex'
  }

  // Загрузка данных из Supabase с пагинацией
  const loadData = async (tab, page = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const tableName = tableMapping[tab]
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      
      // Загружаем данные для текущей страницы
      const { data: pageData, error: dataError, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, to)
      
      if (dataError) {
        throw new Error(`${tableName}: ${dataError.message}`)
      }
      
      setData(pageData || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err.message)
      setData([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка данных при изменении активной вкладки или страницы
  useEffect(() => {
    loadData(activeTab, currentPage)
  }, [activeTab, currentPage])
  
  // Сброс страницы при смене вкладки
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])
  
  // Функции пагинации
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  
  const goToPrevPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)

  return (
    <div className="space-y-6">
      {/* Вкладки */}
      <div className="flex justify-center space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('moysklad')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'moysklad'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Мой Склад
        </button>
        <button
          onClick={() => setActiveTab('ozon')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'ozon'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Озон
        </button>
        <button
          onClick={() => setActiveTab('wb')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'wb'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Вайлдбериз
        </button>
        <button
          onClick={() => setActiveTab('yandex')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'yandex'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Яндекс Маркет
        </button>
      </div>

      {/* Контент вкладки */}
      <div className="min-h-[400px]">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-600">Загрузка данных...</span>
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
          <div className="bg-white p-4 rounded-lg shadow-md">
            {/* Счетчик записей */}
            <div className="mb-4 text-sm text-gray-600">
              Показано {startItem}–{endItem} из {totalCount}
            </div>
            
            <div className="overflow-x-auto">
              <table className="border-collapse border border-gray-300" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr style={{ height: '56px' }}>
                    {Object.keys(data[0]).map(key => {
                      // Определяем ширину колонки по названию
                      let width = '150px'
                      const keyLower = key.toLowerCase()
                      
                      if (keyLower === 'id') width = '250px'
                      else if (keyLower === 'name') width = '250px'
                      else if (keyLower.includes('code')) width = '220px'
                      else if (keyLower.includes('price')) width = '120px'
                      else if (keyLower === 'barcode') width = '160px'
                      else if (keyLower.includes('image') || keyLower.includes('link') || keyLower.includes('url')) width = '100px'
                      
                      return (
                        <th 
                          key={key} 
                          className="px-3 py-3 border bg-gray-100 text-xs text-left font-medium"
                          style={{ width, minWidth: width, maxWidth: width }}
                        >
                          {key}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50" style={{ height: '56px' }}>
                      {Object.entries(item).map(([key, value], j) => {
                        // Определяем ширину колонки
                        let width = '150px'
                        const keyLower = key.toLowerCase()
                        
                        if (keyLower === 'id') width = '250px'
                        else if (keyLower === 'name') width = '250px'
                        else if (keyLower.includes('code')) width = '220px'
                        else if (keyLower.includes('price')) width = '120px'
                        else if (keyLower === 'barcode') width = '160px'
                        else if (keyLower.includes('image') || keyLower.includes('link') || keyLower.includes('url')) width = '100px'
                        
                        // Проверяем поле с изображением
                        const isImageField = keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('picture')
                        
                        // Проверяем поле со ссылкой
                        const isLinkField = keyLower.includes('link') || keyLower.includes('url')
                        
                        if (isImageField && value) {
                          return (
                            <td 
                              key={j} 
                              className="px-3 py-3 border text-xs text-center align-middle"
                              style={{ width, minWidth: width, maxWidth: width, height: '56px' }}
                            >
                              <img 
                                src={value}
                                alt="Товар"
                                className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 mx-auto"
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
                            <td 
                              key={j} 
                              className="px-3 py-3 border text-xs text-center align-middle"
                              style={{ width, minWidth: width, maxWidth: width, height: '56px' }}
                            >
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
                          <td 
                            key={j} 
                            className="px-3 py-3 border text-xs align-middle overflow-hidden"
                            style={{ 
                              width, 
                              minWidth: width, 
                              maxWidth: width, 
                              height: '56px',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={String(value)}
                          >
                            {String(value)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ←
                </button>
                
                {/* Номера страниц */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        pageNum === currentPage
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-1 text-sm border rounded bg-white text-gray-700 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}