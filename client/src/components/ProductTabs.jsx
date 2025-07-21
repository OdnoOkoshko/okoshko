// ProductTabs.jsx - основной компонент с логикой управления данными

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FiSettings } from 'react-icons/fi'
import SearchBar from './SearchBar'
import ProductTable from './ProductTable'
import PaginationControls from './PaginationControls'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const [fullData, setFullData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [hiddenColumns, setHiddenColumns] = useState(() => {
    const saved = localStorage.getItem('hiddenColumns')
    return saved ? JSON.parse(saved) : []
  })
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem(`columnWidths_${activeTab}`)
    return saved ? JSON.parse(saved) : {}
  })
  const [sortConfig, setSortConfig] = useState(() => {
    const saved = localStorage.getItem(`sortState_${activeTab}`)
    return saved ? JSON.parse(saved) : { column: null, direction: null }
  })
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const itemsPerPage = 100

  // Маппинг вкладок на таблицы в БД
  const tableMapping = {
    moysklad: 'products_moysklad',
    ozon: 'products_ozon',
    wb: 'products_wb',
    yandex: 'products_yandex'
  }

  // Конфигурация вкладок
  const tabConfigs = [
    { 
      key: 'moysklad', 
      label: 'Мой Склад', 
      gradient: 'from-cyan-400 to-blue-500' 
    },
    { 
      key: 'ozon', 
      label: 'Озон', 
      gradient: 'from-blue-500 to-blue-600' 
    },
    { 
      key: 'wb', 
      label: 'Вайлдбериз', 
      gradient: 'from-purple-500 to-purple-600' 
    },
    { 
      key: 'yandex', 
      label: 'Яндекс Маркет', 
      gradient: 'from-yellow-400 to-orange-500' 
    }
  ]

  // Загрузка всех данных из Supabase
  const loadData = async (tab) => {
    setLoading(true)
    setError(null)
    
    try {
      const tableName = tableMapping[tab]
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
        
        if (!chunk || chunk.length === 0) break
        
        allData = [...allData, ...chunk]
        if (chunk.length < chunkSize) break
        from += chunkSize
      }
      
      setFullData(allData)
    } catch (err) {
      setError(err.message)
      setFullData([])
    } finally {
      setLoading(false)
    }
  }

  // Эффекты
  useEffect(() => {
    loadData(activeTab)
  }, [activeTab])
  useEffect(() => setCurrentPage(1), [activeTab, searchTerm])
  
  // Сохранение в localStorage при изменении hiddenColumns
  useEffect(() => {
    localStorage.setItem('hiddenColumns', JSON.stringify(hiddenColumns))
  }, [hiddenColumns])

  // Сохранение ширины колонок в localStorage
  useEffect(() => {
    localStorage.setItem(`columnWidths_${activeTab}`, JSON.stringify(columnWidths))
  }, [columnWidths, activeTab])

  // Загрузка ширины колонок при смене вкладки
  useEffect(() => {
    const saved = localStorage.getItem(`columnWidths_${activeTab}`)
    if (saved) {
      setColumnWidths(JSON.parse(saved))
    } else {
      setColumnWidths({})
    }
  }, [activeTab])

  // Сохранение состояния сортировки в localStorage
  useEffect(() => {
    localStorage.setItem(`sortState_${activeTab}`, JSON.stringify(sortConfig))
  }, [sortConfig, activeTab])

  // Загрузка состояния сортировки при смене вкладки
  useEffect(() => {
    const saved = localStorage.getItem(`sortState_${activeTab}`)
    if (saved) {
      setSortConfig(JSON.parse(saved))
    } else {
      setSortConfig({ column: null, direction: null })
    }
  }, [activeTab])

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowColumnMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Определение типа данных в колонке
  const getColumnDataType = (columnKey, data) => {
    if (!data.length) return 'string'
    
    const samples = data.slice(0, 10).map(item => item[columnKey]).filter(val => val != null && val !== '')
    if (samples.length === 0) return 'string'
    
    // Проверяем, все ли значения числа
    const isAllNumbers = samples.every(val => !isNaN(parseFloat(val)) && isFinite(val))
    if (isAllNumbers) return 'number'
    
    return 'string'
  }

  // Функция сравнения для сортировки
  const compareValues = (a, b, dataType, direction) => {
    if (a == null || a === '') a = ''
    if (b == null || b === '') b = ''
    
    let result = 0
    
    if (dataType === 'number') {
      const numA = parseFloat(a) || 0
      const numB = parseFloat(b) || 0
      result = numA - numB
    } else {
      result = String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' })
    }
    
    return direction === 'desc' ? -result : result
  }

  // Фильтрация и сортировка данных
  const processedData = useMemo(() => {
    // Сначала фильтрация
    let filtered = fullData
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = fullData.filter(item => {
        const searchableText = Object.values(item).join(' ').toLowerCase()
        return searchableText.includes(searchLower)
      })
    }
    
    // Затем сортировка
    if (sortConfig.column && sortConfig.direction) {
      const dataType = getColumnDataType(sortConfig.column, filtered)
      filtered = [...filtered].sort((a, b) => 
        compareValues(a[sortConfig.column], b[sortConfig.column], dataType, sortConfig.direction)
      )
    }
    
    return filtered
  }, [fullData, searchTerm, sortConfig])

  const filteredData = processedData

  const totalCount = filteredData.length
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const end = currentPage * itemsPerPage
  const pageData = filteredData.slice(start, end)
  const startItem = start + 1
  const endItem = Math.min(end, totalCount)

  // Функции навигации
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }
  const goToPrevPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)
  
  // Переключение видимости колонки
  const toggleColumn = (column) => {
    setHiddenColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    )
  }

  // Функция сортировки
  const handleSort = (columnKey) => {
    let newDirection = 'asc'
    
    if (sortConfig.column === columnKey) {
      if (sortConfig.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortConfig.direction === 'desc') {
        newDirection = null
      }
    }
    
    setSortConfig({ 
      column: newDirection ? columnKey : null, 
      direction: newDirection 
    })
  }

  return (
    <div className="space-y-6">
      {/* Вкладки */}
      <div className="flex justify-center space-x-1 bg-gray-100 rounded-lg p-1">
        {tabConfigs.map(({ key, label, gradient }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === key
                ? `bg-gradient-to-r ${gradient} text-white shadow-sm`
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Контент */}
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

        {!loading && !error && fullData.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-lg font-medium">Нет данных для отображения</div>
            </div>
          </div>
        )}

        {!loading && !error && fullData.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            {/* Компактная панель управления */}
            <div className="grid grid-cols-3 items-center mb-3">
              {/* Левая часть - счетчик записей */}
              <div className="text-sm text-gray-600">
                {searchTerm ? (
                  <>Найдено {filteredData.length} из {fullData.length} • Показано {startItem}–{endItem}</>
                ) : (
                  <>Показано {startItem}–{endItem} из {totalCount}</>
                )}
              </div>
              
              {/* Центральная часть - поиск */}
              <div className="flex justify-center">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </div>
              
              {/* Правая часть - кнопка управления столбцами */}
              <div className="flex justify-end">
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    title="Управление столбцами"
                  >
                    <FiSettings size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {pageData.length === 0 && searchTerm.trim() !== '' ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-lg font-medium">Нет совпадений</div>
                <div className="text-sm mt-2">Попробуйте изменить поисковый запрос</div>
              </div>
            ) : (
              <ProductTable 
                pageData={pageData} 
                fullData={fullData}
                showColumnMenu={showColumnMenu}
                setShowColumnMenu={setShowColumnMenu}
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
                menuRef={menuRef}
                buttonRef={buttonRef}
                toggleColumn={toggleColumn}
                searchTerm={searchTerm}
                columnWidths={columnWidths}
                setColumnWidths={setColumnWidths}
                activeTab={activeTab}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            )}
            
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              goToPrevPage={goToPrevPage}
              goToNextPage={goToNextPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}