import { useState, useEffect, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { supabase } from '../lib/supabaseClient'

// Регистрируем все модули AG Grid Community
ModuleRegistry.registerModules([AllCommunityModule])

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gridApi, setGridApi] = useState(null)
  const [showColumnsPanel, setShowColumnsPanel] = useState(false)

  const tabs = [
    { id: 'moysklad', name: 'МойСклад' },
    { id: 'ozon', name: 'Ozon' },
    { id: 'wb', name: 'WB' },
    { id: 'yandex', name: 'Яндекс' }
  ]

  const tableMapping = {
    moysklad: 'products_moysklad',
    ozon: 'products_ozon',
    wb: 'products_wb',
    yandex: 'products_yandex'
  }

  // Загрузка данных из Supabase
  const loadData = async (tab) => {
    setLoading(true)
    setError(null)
    
    try {
      const tableName = tableMapping[tab]
      
      // Загружаем все данные порциями по 1000, чтобы обойти лимит Supabase
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
        
        if (!chunk || chunk.length === 0) {
          break
        }
        
        allData = [...allData, ...chunk]
        
        // Если получили меньше чем chunkSize, значит это последняя порция
        if (chunk.length < chunkSize) {
          break
        }
        
        from += chunkSize
      }
      
      setData(allData)
    } catch (err) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Загрузка данных при изменении активной вкладки
  useEffect(() => {
    loadData(activeTab)
  }, [activeTab])

  // Сохранение и загрузка пользовательских заголовков
  const getSavedColumnName = (originalName, tableName) => {
    const key = `colname_${tableName}_${originalName}`
    return localStorage.getItem(key) || originalName
  }

  const saveColumnName = (originalName, newName, tableName) => {
    const key = `colname_${tableName}_${originalName}`
    localStorage.setItem(key, newName)
  }

  // Компонент заголовка с возможностью редактирования
  const EditableHeader = ({ column, originalName, tableName }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [headerText, setHeaderText] = useState(getSavedColumnName(originalName, tableName))

    const handleDoubleClick = () => {
      setIsEditing(true)
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      saveColumnName(originalName, headerText, tableName)
      setIsEditing(false)
      column.setColDef({ ...column.getColDef(), headerName: headerText })
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setHeaderText(getSavedColumnName(originalName, tableName))
        setIsEditing(false)
      }
    }

    if (isEditing) {
      return (
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="w-full px-1 py-0 text-xs bg-white border border-blue-500 rounded"
            autoFocus
          />
        </form>
      )
    }

    return (
      <span onDoubleClick={handleDoubleClick} className="cursor-pointer select-none">
        {headerText}
      </span>
    )
  }

  // Компонент для отображения изображений
  const ImageCellRenderer = ({ value }) => {
    if (!value) return ''
    
    const handleClick = () => {
      window.open(value, '_blank')
    }

    return (
      <div className="flex items-center justify-center">
        <img 
          src={value}
          alt="Товар"
          className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleClick}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentNode.innerHTML = '<button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Открыть</button>'
            e.target.parentNode.onclick = handleClick
          }}
        />
      </div>
    )
  }

  // Компонент для отображения ссылок
  const LinkCellRenderer = ({ value }) => {
    if (!value) return ''
    
    const handleClick = () => {
      window.open(value, '_blank')
    }

    return (
      <button 
        onClick={handleClick}
        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Открыть
      </button>
    )
  }

  // Компонент для обычных ячеек с tooltip
  const DefaultCellRenderer = ({ value }) => {
    if (!value) return ''
    
    const displayValue = String(value)
    const isLong = displayValue.length > 40
    
    return (
      <div 
        className="truncate px-2 py-1" 
        title={isLong ? displayValue : ''}
        style={{ 
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        {displayValue}
      </div>
    )
  }

  // Генерация колонок для AG Grid
  const columnDefs = useMemo(() => {
    if (data.length === 0) return []

    const columns = Object.keys(data[0])
    const tableName = tableMapping[activeTab]

    return columns.map(field => {
      const isImageField = field.toLowerCase().includes('image') || field.toLowerCase().includes('photo') || field.toLowerCase().includes('picture')
      const isLinkField = field.toLowerCase().includes('link') || field.toLowerCase().includes('url')
      
      let cellRenderer = DefaultCellRenderer
      let minWidth = 120
      let maxWidth = undefined
      let flex = 1
      
      if (isImageField) {
        cellRenderer = ImageCellRenderer
        minWidth = 80
        maxWidth = 100
        flex = 0
      } else if (isLinkField) {
        cellRenderer = LinkCellRenderer
        minWidth = 100
        maxWidth = 150
        flex = 0
      }
      
      return {
        field,
        headerName: getSavedColumnName(field, tableName),
        sortable: true,
        filter: true,
        resizable: true,
        headerComponent: (params) => (
          <EditableHeader 
            column={params.column} 
            originalName={field} 
            tableName={tableName} 
          />
        ),
        cellRenderer,
        minWidth,
        maxWidth,
        flex,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }
    })
  }, [data, activeTab])

  // Настройки AG Grid
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true
  }), [])

  return (
    <div className="max-w-full overflow-auto">
      {/* Заголовок */}
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Okoshko - Единое окно заказов</h1>
        
        {/* Вкладки и управление */}
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="flex justify-between items-center">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
            
            {/* Кнопка управления колонками */}
            {gridApi && (
              <button
                onClick={() => setShowColumnsPanel(!showColumnsPanel)}
                className="px-4 py-2 bg-white text-gray-700 rounded-md shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
              >
                📋 Колонки
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Панель управления колонками */}
      {showColumnsPanel && gridApi && (
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="font-medium text-gray-900 mb-3">Управление колонками</h3>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {gridApi.getColumns()?.map((column) => (
              <label key={column.getColId()} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={column.isVisible()}
                  onChange={(e) => {
                    gridApi.setColumnsVisible([column.getColId()], e.target.checked)
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{column.getColDef().headerName}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Содержимое */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <div className="text-gray-600 mt-4 font-medium">Загрузка данных...</div>
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
          <div className="ag-theme-alpine p-4 bg-white shadow-md rounded-md" style={{ height: '650px' }}>
            <AgGridReact
              rowData={data}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              suppressHorizontalScroll={false}
              suppressColumnVirtualisation={false}
              animateRows={true}
              rowSelection={{ 
                mode: 'multiRow',
                checkboxes: true,
                headerCheckbox: true
              }}
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[50, 100, 200, 500]}
              onGridReady={(params) => {
                setGridApi(params.api)
                setTimeout(() => {
                  params.api.sizeColumnsToFit()
                }, 100)
              }}
              rowClassRules={{
                'ag-row-selected': (params) => params.node.selected,
              }}
              getRowStyle={(params) => {
                if (params.node.selected) {
                  return { backgroundColor: '#f0f9ff' }
                }
                return null
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}