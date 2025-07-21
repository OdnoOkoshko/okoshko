// ProductTable.jsx - компонент таблицы товаров

export default function ProductTable({ pageData, fullData }) {
  if (!pageData.length) return null

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
    <div className="overflow-x-auto">
      <table className="border-collapse border border-gray-300" style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead>
          <tr style={{ height: '56px' }}>
            {Object.keys(fullData[0] || pageData[0] || {}).map(key => {
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
              {Object.entries(item).map(([key, value], j) => {
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
  )
}