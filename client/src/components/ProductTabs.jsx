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
    const isLong = displayValue.length > 30
    
    return (
      <div 
        className="truncate" 
        title={isLong ? displayValue : ''}
        style={{ maxWidth: '100%' }}
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
      const isLinkField = field.toLowerCase().includes('link') || field.toLowerCase().includes('url')
      
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
        cellRenderer: isLinkField ? LinkCellRenderer : DefaultCellRenderer,
        minWidth: isLinkField ? 100 : 120,
        maxWidth: isLinkField ? 150 : undefined,
        flex: isLinkField ? 0 : 1,
        cellStyle: {
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
    <div className="w-full">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Okoshko - Единое окно заказов</h1>
        
        {/* Вкладки */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Содержимое */}
      <div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <div className="text-gray-500 mt-2">Загрузка данных...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет данных для отображения
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="ag-theme-alpine w-full mb-6" style={{ height: '600px' }}>
            <AgGridReact
              rowData={data}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              suppressHorizontalScroll={false}
              suppressColumnVirtualisation={false}
              animateRows={true}
              rowSelection={{ mode: 'multiRow' }}
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[50, 100, 200, 500]}
              onGridReady={(params) => {
                // Автоматический размер колонок при загрузке
                setTimeout(() => {
                  params.api.sizeColumnsToFit()
                }, 100)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}