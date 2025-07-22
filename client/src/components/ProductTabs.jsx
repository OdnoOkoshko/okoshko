// ProductTabs.jsx - основной компонент с логикой управления данными

import { useState, useEffect, useMemo, useRef } from 'react'
import { FiSettings, FiRotateCcw } from 'react-icons/fi'
import SearchBar from './SearchBar'
import ProductTable from './ProductTable'
import PaginationControls from './PaginationControls'
import { usePersistentState } from '../../../shared/hooks/usePersistentState'
import { usePersistentStateWithKey } from '../../../shared/hooks/usePersistentStateWithKey'
import { removeFromStorage } from '../../../shared/storage.ts'
import { useTabData } from '../hooks/useTabData.js'
import { TAB_CONFIGS } from '../config/tabs.js'
import { sortData } from '../utils/sortData.js'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const { tabData, loading, error, fetchTabData } = useTabData()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [hiddenColumns, setHiddenColumns] = usePersistentState('okoshko_hiddenColumns', [])
  const [columnWidths, setColumnWidths] = usePersistentStateWithKey(() => `okoshko_columnWidths_${activeTab}`, {}, [activeTab])
  const [sortConfig, setSortConfig] = usePersistentStateWithKey(() => `okoshko_sortConfig_${activeTab}`, { column: null, direction: null }, [activeTab])
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const itemsPerPage = 100

  // Загрузка данных при переключении вкладки
  useEffect(() => {
    fetchTabData(activeTab)
  }, [activeTab])
  
  useEffect(() => setCurrentPage(1), [activeTab, searchTerm])

  // Получение текущих данных для активной вкладки
  const fullData = tabData[activeTab] || []
  


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

    // Затем сортировка с помощью утилиты
    return sortData(filtered, sortConfig)
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
    
    const newSortConfig = { 
      column: newDirection ? columnKey : null, 
      direction: newDirection 
    }
    
    setSortConfig(newSortConfig)
  }

  // Функция сброса настроек таблицы
  const handleResetSettings = () => {
    // Удаляем настройки из localStorage
    removeFromStorage(`okoshko_columnWidths_${activeTab}`)
    removeFromStorage(`okoshko_sortConfig_${activeTab}`)
    removeFromStorage('okoshko_hiddenColumns')
    
    // Сбрасываем состояния к дефолтным
    setColumnWidths({})
    setSortConfig({ column: null, direction: null })
    setHiddenColumns([])
  }

  // Функция переключения вкладки
  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey)
    // Если вкладка еще не загружена, данные загрузятся в useEffect
  }

  return (
    <div className="space-y-6">
      {/* Вкладки */}
      <div className="flex justify-center space-x-1 bg-gray-100 rounded-lg p-1">
        {TAB_CONFIGS.map(({ key, label, gradient }) => (
          <button
            key={key}
            onClick={() => handleTabSwitch(key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === key
                ? `bg-gradient-to-r ${gradient} text-white shadow-sm`
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {label}
            {!tabData[key] && key !== activeTab && (
              <span className="ml-1 text-xs opacity-60">•</span>
            )}
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
          <div className="text-red-600 p-8 text-center bg-red-50 border border-red-200 rounded">
            <div className="text-lg font-medium mb-2">Не удалось загрузить данные</div>
            <div className="text-sm text-red-500">Попробуйте обновить страницу или выберите другую вкладку</div>
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
              
              {/* Правая часть - кнопки управления */}
              <div className="flex justify-end items-center space-x-1">
                <button
                  onClick={handleResetSettings}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  title="Сбросить настройки таблицы"
                >
                  <FiRotateCcw size={18} />
                </button>
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