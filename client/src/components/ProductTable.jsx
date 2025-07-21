// ProductTable.jsx - компонент таблицы товаров

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FiSettings } from 'react-icons/fi'

export default function ProductTable({ pageData, fullData, showColumnMenu, setShowColumnMenu, hiddenColumns, setHiddenColumns, menuRef, buttonRef, toggleColumn, searchTerm = '', columnWidths, setColumnWidths, activeTab, sortConfig, onSort }) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeColumn, setResizeColumn] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [brokenImages, setBrokenImages] = useState(new Set())

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

  // Начало изменения ширины - мемоизация для производительности
  const handleMouseDown = useCallback((e, columnKey) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeColumn(columnKey)
    setStartX(e.clientX)
    setStartWidth(parseInt(getColumnWidth(columnKey)))
    document.body.style.cursor = 'col-resize'
  }, [getColumnWidth])

  // Процесс изменения ширины - мемоизация для производительности
  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !resizeColumn) return
    
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
  const isImageField = useCallback((key) => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('picture')
  }, [])

  const isLinkField = useCallback((key) => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('link') || keyLower.includes('url')
  }, [])

  // Обработка ошибки изображения - безопасный подход без прямой манипуляции DOM
  const handleImageError = useCallback((imageUrl) => {
    setBrokenImages(prev => new Set([...prev, imageUrl]))
  }, [])

  // Стили ячейки
  const cellStyles = (width) => ({
    width,
    minWidth: width,
    maxWidth: width,
    height: '48px'
  })

  const textCellStyles = (width) => ({
    ...cellStyles(width),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  })

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

        </div>
      )}

      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr style={{ height: '48px' }}>
              {visibleColumns.map(key => {
                const width = getColumnWidth(key)
                const isSorted = sortConfig.column === key
                return (
                  <th 
                    key={key} 
                    className="px-3 py-2 border bg-gray-100 text-xs text-left font-medium relative cursor-pointer hover:bg-gray-200 transition-colors"
                    style={cellStyles(width)}
                    onClick={() => onSort(key)}
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
              <tr key={i} className="hover:bg-blue-50 transition-colors duration-150" style={{ height: '48px' }}>
                {visibleColumns.map((key, j) => {
                  const value = item[key]
                  const width = getColumnWidth(key)
                  
                  if (isImageField(key) && value) {
                    const isImageBroken = brokenImages.has(value)
                    
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-2 border text-xs text-center align-middle"
                        style={cellStyles(width)}
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
                        className="px-3 py-2 border text-xs text-center align-middle"
                        style={cellStyles(width)}
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
                      className="px-3 py-2 border text-xs align-middle overflow-hidden"
                      style={textCellStyles(width)}
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