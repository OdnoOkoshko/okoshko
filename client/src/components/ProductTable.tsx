// ProductTable.tsx - компонент таблицы товаров

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FiSettings } from 'react-icons/fi'
import type { Product, SortConfig } from '@shared/types'

interface ProductTableProps {
  columns: {
    hiddenColumns: string[]
    setHiddenColumns: (value: string[] | ((prev: string[]) => string[])) => void
    columnWidths: Record<string, number>
    setColumnWidths: (value: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void
    activeTab: string
  }
  pagination: {
    pageData: Product[]
    fullData: Product[]
  }
  sorting: {
    sortConfig: SortConfig
    onSort: (columnKey: string) => void
  }
  menu: {
    showColumnMenu: boolean
    setShowColumnMenu: (value: boolean) => void
    menuRef: React.RefObject<HTMLDivElement>
    buttonRef: React.RefObject<HTMLButtonElement>
    toggleColumn: (column: string) => void
    itemsPerPage: number
    setItemsPerPage: (value: number) => void
  }
  search: {
    searchTerm: string
  }
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  columns,
  pagination,
  sorting,
  menu,
  search
}) => {
  // Деструктуризация пропсов
  const { hiddenColumns, setHiddenColumns, columnWidths, setColumnWidths, activeTab } = columns
  const { pageData, fullData } = pagination
  const { sortConfig, onSort } = sorting
  const { showColumnMenu, setShowColumnMenu, menuRef, buttonRef, toggleColumn, itemsPerPage, setItemsPerPage } = menu
  const { searchTerm = '' } = search
  const [isResizing, setIsResizing] = useState(false)
  const [resizeColumn, setResizeColumn] = useState<string | null>(null)
  const [startX, setStartX] = useState<number>(0)
  const [startWidth, setStartWidth] = useState<number>(0)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())
  const dragStarted = useRef<boolean>(false)

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
  const getColumnWidth = useCallback((key: string): string => {
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

  // Начало изменения ширины - мемоизация для производительности
  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault()
    dragStarted.current = false // Сброс флага перетаскивания
    setIsResizing(true)
    setResizeColumn(columnKey)
    setStartX(e.clientX)
    setStartWidth(parseInt(getColumnWidth(columnKey)))
    document.body.style.cursor = 'col-resize'
  }, [getColumnWidth])

  // Процесс изменения ширины - мемоизация для производительности
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeColumn) return
    
    dragStarted.current = true // Флаг что началось перетаскивание
    const diff = e.clientX - startX
    const newWidth = Math.max(50, startWidth + diff) // Минимальная ширина 50px
    
    setColumnWidths(prev => ({
      ...prev,
      [resizeColumn]: newWidth
    }))
  }, [isResizing, resizeColumn, startX, startWidth, setColumnWidths])

  // Завершение изменения ширины - мемоизация для производительности
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false)
      setResizeColumn(null)
      document.body.style.cursor = 'default'
      // Небольшая задержка чтобы сброс произошел после onClick
      setTimeout(() => {
        dragStarted.current = false
      }, 50)
    }
  }, [isResizing])

  // Эффекты для обработки событий мыши
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Проверка типа поля - мемоизация для производительности
  const isImageField = (key: string): boolean => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('picture')
  }

  const isLinkField = (key: string): boolean => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('link') || keyLower.includes('url')
  }

  // Обработка ошибки изображения
  const handleImageError = (imageUrl: string) => {
    setBrokenImages(prev => new Set(Array.from(prev).concat(imageUrl)))
  }

  // Стили ячейки удалены - используются inline-стили


  return (
    <div className="relative">
      {/* Выпадающее меню управления столбцами */}
      {showColumnMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-12 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[220px]"
        >
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700">Видимые столбцы:</div>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {allColumns.map(column => (
              <label key={column} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="text-blue-600"
                />
                <span className="text-gray-700">{column}</span>
              </label>
            ))}
          </div>

          {/* Разделитель */}
          <div className="border-t border-gray-200 my-3"></div>

          {/* Выбор количества строк */}
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Количество строк:</div>
            <div className="flex gap-3">
              {[50, 100, 200].map(size => (
                <label key={size} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="pageSize"
                    value={size}
                    checked={itemsPerPage === size}
                    onChange={() => setItemsPerPage(size)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
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
                    onClick={() => {
                      if (dragStarted.current) return // Игнорируем клик после перетаскивания
                      onSort(key)
                    }}
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

export default ProductTable