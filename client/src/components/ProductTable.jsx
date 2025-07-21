// ProductTable.jsx - компонент таблицы товаров

import { useState, useEffect, useRef } from 'react'
import { FiSettings } from 'react-icons/fi'

export default function ProductTable({ pageData, fullData, showColumnMenu, setShowColumnMenu, hiddenColumns, setHiddenColumns, menuRef, buttonRef, toggleColumn }) {


  if (!pageData.length) return null

  // Получение всех колонок
  const allColumns = Object.keys(fullData[0] || pageData[0] || {})
  
  // Фильтрация видимых колонок
  const visibleColumns = allColumns.filter(col => !hiddenColumns.includes(col))



  // Определение ширины колонки по названию
  const getColumnWidth = (key) => {
    const keyLower = key.toLowerCase()
    if (keyLower === 'id') return '250px'
    if (keyLower === 'name') return '250px'
    if (keyLower.includes('code')) return '220px'
    if (keyLower.includes('price')) return '120px'
    if (keyLower === 'barcode') return '160px'
    if (keyLower.includes('image') || keyLower.includes('link') || keyLower.includes('url')) return '100px'
    return '150px'
  }

  // Проверка типа поля
  const isImageField = (key) => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('picture')
  }

  const isLinkField = (key) => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('link') || keyLower.includes('url')
  }

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
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">Видимые столбцы:</div>
            <div className="flex gap-1">
              <button
                onClick={() => setHiddenColumns([])}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Все
              </button>
              <button
                onClick={() => setHiddenColumns([...allColumns])}
                className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Скрыть
              </button>
            </div>
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
                return (
                  <th 
                    key={key} 
                    className="px-3 py-2 border bg-gray-100 text-xs text-left font-medium"
                    style={cellStyles(width)}
                  >
                    {key}
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
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-2 border text-xs text-center align-middle"
                        style={cellStyles(width)}
                      >
                        <img 
                          src={value}
                          alt="Товар"
                          className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 mx-auto"
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
                  
                  if (isLinkField(key) && value) {
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-2 border text-xs text-center align-middle"
                        style={cellStyles(width)}
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