// ProductTable.jsx - компонент таблицы товаров

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FiSettings } from 'react-icons/fi'
import ColumnMenu from './ColumnMenu'
import useColumnResize from '../hooks/useColumnResize'
import { isImageField, isLinkField, useImageError } from '../utils/tableUtils'

export default function ProductTable({ 
  columns,
  pagination,
  sorting,
  menu,
  search
}) {
  // Деструктуризация пропсов
  const { hiddenColumns, setHiddenColumns, columnWidths, setColumnWidths, activeTab } = columns
  const { pageData, fullData } = pagination
  const { sortConfig, onSort } = sorting
  const { showColumnMenu, setShowColumnMenu, menuRef, buttonRef, toggleColumn, itemsPerPage, setItemsPerPage } = menu
  const { searchTerm = '' } = search

  if (!pageData.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-lg font-medium">Нет данных для отображения</div>
      </div>
    )
  }

  // Получение всех колонок - мемоизация для производительности
  const allColumns = useMemo(() => {
    return Object.keys(fullData[0] || pageData[0] || {})
  }, [fullData, pageData])
  
  // Фильтрация видимых колонок - мемоизация для производительности  
  const visibleColumns = useMemo(() => {
    return allColumns.filter(col => !hiddenColumns.includes(col))
  }, [allColumns, hiddenColumns])

  // Определение ширины колонки с учетом сохраненных значений - мемоизация для производительности
  const getColumnWidth = useCallback((key) => {
    if (columnWidths[key]) {
      return `${columnWidths[key]}px`
    }
    
    const keyLower = key.toLowerCase()
    if (keyLower === 'id') return '250px'
    if (keyLower === 'name') return '250px'
    if (keyLower.includes('code')) return '220px'
    if (keyLower.includes('price')) return '120px'
    if (keyLower === 'barcode') return '160px'
    if (keyLower.includes('image') || keyLower.includes('link') || keyLower.includes('url')) return '100px'
    return '150px'
  }, [columnWidths])

  // Ресайз колонок через хук
  const {
    handleMouseDown,
    isResizing,
    handleMouseMove,
    handleMouseUp,
    resizeColumn,
    dragStarted,
    startX,
    startWidth
  } = useColumnResize({
    getColumnWidth,
    setColumnWidths
  })

  // Обработка ошибок изображений через хук
  const { brokenImages, handleImageError } = useImageError()

  // Обработка клика по заголовку
  const handleHeaderClick = useCallback((key) => {
    if (!dragStarted.current) {
      onSort(key)
    }
  }, [onSort])

  // Стили ячейки удалены - используются inline-стили


  return (
    <div className="relative">
      {/* Выпадающее меню управления столбцами */}
      {showColumnMenu && (
        <ColumnMenu
          allColumns={allColumns}
          hiddenColumns={hiddenColumns}
          toggleColumn={toggleColumn}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          menuRef={menuRef}
        />
      )}

      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300 table-fixed w-full">
          <thead>
            <tr className="h-12">
              {visibleColumns.map(key => {
                const width = getColumnWidth(key)
                const isSorted = sortConfig.column === key
                return (
                  <th 
                    key={key} 
                    className="px-3 py-2 border bg-gray-100 text-xs text-left font-medium relative cursor-pointer hover:bg-gray-200 transition-colors h-12"
                    style={{ width }}
                    onClick={() => handleHeaderClick(key)}
                    title="Нажмите для сортировки"
                  >
                    <div className="flex items-center justify-between pr-2">
                      <span>{key}</span>
                      {isSorted && (
                        <span className="text-blue-600 font-bold">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                    {/* Ручка для изменения ширины */}
                    <div
                      className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-300 bg-transparent"
                      onMouseDown={(e) => {
                        e.stopPropagation() // Предотвращаем срабатывание сортировки
                        handleMouseDown(e, key)
                      }}
                      title="Перетащите для изменения ширины"
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors duration-150 h-12">
                {visibleColumns.map((key, j) => {
                  const value = item[key]
                  const width = getColumnWidth(key)
                  
                  if (isImageField(key) && value) {
                    const isImageBroken = brokenImages.has(value)
                    
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-2 border text-xs text-center align-middle h-12"
                        style={{ width }}
                      >
                        {isImageBroken ? (
                          <button 
                            disabled
                            className="px-2 py-1 text-xs bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                          >
                            Открыть
                          </button>
                        ) : (
                          <img 
                            src={value}
                            alt="Товар"
                            className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 mx-auto"
                            onClick={() => window.open(value, '_blank', 'noopener,noreferrer')}
                            onError={() => handleImageError(value)}
                          />
                        )}
                      </td>
                    )
                  }
                  
                  if (isLinkField(key) && value) {
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-2 border text-xs text-center align-middle h-12"
                        style={{ width }}
                      >
                        <button 
                          onClick={() => window.open(value, '_blank', 'noopener,noreferrer')}
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
                      className="px-3 py-2 border text-xs align-middle h-12 overflow-hidden whitespace-nowrap text-ellipsis"
                      style={{ width }}
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
    </div>
  )
}