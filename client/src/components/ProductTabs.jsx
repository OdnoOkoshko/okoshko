// ProductTabs.jsx - основной компонент с логикой управления данными

import { useState, useEffect, useMemo, useRef } from 'react'
import { FiSettings, FiRotateCcw } from 'react-icons/fi'
import SearchBar from './SearchBar'
import ProductTable from './ProductTable'
import PaginationControls from './PaginationControls'
import TableToolbar from './TableToolbar'
import { usePersistentState } from '../shared/hooks/usePersistentState'
import { usePersistentStateWithKey } from '../shared/hooks/usePersistentStateWithKey'
import { removeFromStorage } from '../shared/storage'
import { useTabData } from '@/hooks/useTabData'
import { usePagination } from '@/hooks/usePagination'
import { useClickOutside } from '@/hooks/useClickOutside'
import { TAB_CONFIGS } from '@/config/tabs'
import { sortData } from '@/utils/sortData'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const { tabData, loading, error, fetchTabData } = useTabData()
  const [searchTerm, setSearchTerm] = useState('')
  const [hiddenColumns, setHiddenColumns] = usePersistentState('okoshko_hiddenColumns', [])
  const [columnWidths, setColumnWidths] = usePersistentStateWithKey(() => `okoshko_columnWidths_${activeTab}`, {}, [activeTab])
  const [sortConfig, setSortConfig] = usePersistentStateWithKey(() => `okoshko_sortConfig_${activeTab}`, { column: null, direction: null }, [activeTab])
  const [itemsPerPage, setItemsPerPage] = usePersistentStateWithKey(() => `okoshko_${activeTab}_page_size`, 100, [activeTab])
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Загрузка данных при переключении вкладки
  useEffect(() => {
    fetchTabData(activeTab)
  }, [activeTab])

  // Получение текущих данных для активной вкладки
  const fullData = tabData[activeTab] || []

  // Закрытие меню при клике вне его
  useClickOutside([menuRef, buttonRef], () => setShowColumnMenu(false))

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

  // Пагинация с помощью хука
  const pagination = usePagination(processedData, itemsPerPage)
  
  // Обновление страницы при изменении поиска или вкладки
  useEffect(() => {
    pagination.setCurrentPage(1)
  }, [activeTab, searchTerm, pagination.setCurrentPage])
  
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
    removeFromStorage(`okoshko_${activeTab}_page_size`)
    removeFromStorage('okoshko_hiddenColumns')
    
    // Сбрасываем состояния к дефолтным
    setColumnWidths({})
    setSortConfig({ column: null, direction: null })
    setItemsPerPage(100)
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
          <p className="text-red-500">Ошибка загрузки данных</p>
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
            <TableToolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleResetSettings={handleResetSettings}
              setShowColumnMenu={setShowColumnMenu}
              showColumnMenu={showColumnMenu}
              buttonRef={buttonRef}
            >
              <div className="text-sm text-gray-600">
                {searchTerm ? (
                  <>Найдено {processedData.length} из {fullData.length} • Показано {pagination.startItem}–{pagination.endItem}</>
                ) : (
                  <>Показано {pagination.startItem}–{pagination.endItem} из {pagination.totalCount}</>
                )}
              </div>
            </TableToolbar>
            
            {pagination.pageData.length === 0 && searchTerm.trim() !== '' ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-lg font-medium">Нет совпадений</div>
                <div className="text-sm mt-2">Попробуйте изменить поисковый запрос</div>
              </div>
            ) : (
              <ProductTable 
                columns={{
                  hiddenColumns,
                  setHiddenColumns,
                  columnWidths,
                  setColumnWidths,
                  activeTab
                }}
                pagination={{
                  pageData: pagination.pageData,
                  fullData
                }}
                sorting={{
                  sortConfig,
                  onSort: handleSort
                }}
                menu={{
                  showColumnMenu,
                  setShowColumnMenu,
                  menuRef,
                  buttonRef,
                  toggleColumn,
                  itemsPerPage,
                  setItemsPerPage
                }}
                search={{
                  searchTerm
                }}
              />
            )}
            
            <PaginationControls 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              goToPage={pagination.goToPage}
              goToPrevPage={pagination.goToPrevPage}
              goToNextPage={pagination.goToNextPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}