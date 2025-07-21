// ProductTable.jsx - компонент таблицы товаров

import { useState, useEffect, useRef } from 'react'
import { FiSettings } from 'react-icons/fi'

export default function ProductTable({ pageData, fullData }) {
  const [hiddenColumns, setHiddenColumns] = useState(() => {
    const saved = localStorage.getItem('hiddenColumns')
    return saved ? JSON.parse(saved) : []
  })
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Сохранение в localStorage при изменении hiddenColumns
  useEffect(() => {
    localStorage.setItem('hiddenColumns', JSON.stringify(hiddenColumns))
  }, [hiddenColumns])

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

  if (!pageData.length) return null

  // Получение всех колонок
  const allColumns = Object.keys(fullData[0] || pageData[0] || {})
  
  // Фильтрация видимых колонок
  const visibleColumns = allColumns.filter(col => !hiddenColumns.includes(col))

  // Переключение видимости колонки
  const toggleColumn = (column) => {
    setHiddenColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    )
  }

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
    height: '56px'
  })

  const textCellStyles = (width) => ({
    ...cellStyles(width),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  })

  return (
    <div className="relative">
      {/* Кнопка управления столбцами */}
      <div className="flex justify-end mb-2">
        <button
          ref={buttonRef}
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Управление столбцами"
        >
          <FiSettings size={16} />
        </button>
      </div>

      {/* Выпадающее меню управления столбцами */}
      {showColumnMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-10 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px]"
        >
          <div className="text-sm font-medium text-gray-700 mb-2">Видимые столбцы:</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allColumns.map(column => (
              <label key={column} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr style={{ height: '56px' }}>
              {visibleColumns.map(key => {
                const width = getColumnWidth(key)
                return (
                  <th 
                    key={key} 
                    className="px-3 py-3 border bg-gray-100 text-xs text-left font-medium"
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
              <tr key={i} className="hover:bg-gray-50" style={{ height: '56px' }}>
                {visibleColumns.map((key, j) => {
                  const value = item[key]
                  const width = getColumnWidth(key)
                  
                  if (isImageField(key) && value) {
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-3 border text-xs text-center align-middle"
                        style={cellStyles(width)}
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
                  
                  if (isLinkField(key) && value) {
                    return (
                      <td 
                        key={j} 
                        className="px-3 py-3 border text-xs text-center align-middle"
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
                      className="px-3 py-3 border text-xs align-middle overflow-hidden"
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