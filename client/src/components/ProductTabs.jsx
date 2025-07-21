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


  const tabs = [
    { id: 'moysklad', name: 'Мой Склад' },
    { id: 'ozon', name: 'Озон' },
    { id: 'wb', name: 'Вайлдбериз' },
    { id: 'yandex', name: 'Яндекс Маркет' }
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

  // Компонент заголовка с возможностью редактирования и сортировки
  const EditableHeader = ({ column, originalName, tableName }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [headerText, setHeaderText] = useState(getSavedColumnName(originalName, tableName))
    const [sortState, setSortState] = useState(null) // 'asc', 'desc', null

    const handleDoubleClick = (e) => {
      e.stopPropagation()
      setIsEditing(true)
    }

    const handleClick = (e) => {
      if (!isEditing && gridApi && !gridApi.isDestroyed()) {
        e.stopPropagation()
        
        // Циклическая сортировка: null → asc → desc → null
        let newSortState = null
        if (sortState === null) {
          newSortState = 'asc'
        } else if (sortState === 'asc') {
          newSortState = 'desc'
        } else {
          newSortState = null
        }
        
        setSortState(newSortState)
        
        try {
          gridApi.applyColumnState({
            state: [{ colId: column.getColId(), sort: newSortState }],
            defaultState: { sort: null }
          })
        } catch (error) {
          console.warn('Ошибка сортировки:', error)
        }
      }
    }

    // Сброс состояния сортировки при смене вкладки
    useEffect(() => {
      setSortState(null)
    }, [activeTab])

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
      <div 
        onClick={handleClick}
        onDoubleClick={handleDoubleClick} 
        className="cursor-pointer select-none hover:text-blue-600 transition-colors flex items-center"
        title="Клик - сортировка, двойной клик - переименовать"
      >
        <span>{headerText}</span>
        {sortState && (
          <span className="ml-1 text-blue-500 font-bold">
            {sortState === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
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

  // Русская локализация с правильным ключом для Page Size
  const localeText = useMemo(() => ({
    // Фильтры
    filterOoo: 'Фильтр...',
    equals: 'Равно',
    notEqual: 'Не равно', 
    contains: 'Содержит',
    notContains: 'Не содержит',
    startsWith: 'Начинается с',
    endsWith: 'Заканчивается на',
    blank: 'Пустое',
    notBlank: 'Не пустое',
    
    // Пагинация - правильные ключи
    page: 'Страница',
    to: 'до',
    of: 'из',
    next: 'Следующая',
    last: 'Последняя', 
    first: 'Первая',
    previous: 'Предыдущая',
    loadingOoo: 'Загрузка...',
    noRowsToShow: 'Нет данных для отображения',
    
    // ГЛАВНОЕ - правильный ключ для размера страницы!
    ariaPageSizeSelector: 'Размер страницы',
    ariaPageSizeSelectorLabel: 'Размер страницы',
    
    // Меню и операции
    columns: 'Колонки',
    filters: 'Фильтры',
    copy: 'Копировать',
    copyWithHeaders: 'Копировать с заголовками',
    selectAll: 'Выбрать всё',
    deselectAll: 'Снять выделение'
  }), [])

  return (
    <div className="max-w-full overflow-auto">
      <div className="mb-6 space-y-4">
        {/* Вкладки */}
        <div className="flex justify-center gap-2">
          {tabs.map((tab) => {
            const getTabStyles = (tabId) => {
              const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-opacity'
              const gradients = {
                moysklad: 'bg-gradient-to-r from-[#00B2FF] to-[#009EE3] text-white',
                ozon: 'bg-gradient-to-r from-[#005BFF] to-[#338EFF] text-white',
                wb: 'bg-gradient-to-r from-[#A72974] to-[#D91A94] text-white',
                yandex: 'bg-gradient-to-r from-[#FFCC00] to-[#FF9900] text-black'
              }
              
              const opacity = activeTab === tabId ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              return `${baseClasses} ${gradients[tabId]} ${opacity}`
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={getTabStyles(tab.id)}
              >
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Содержимое */}
      <div className="mt-4 space-y-4">
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
              defaultColDef={Object.assign({}, defaultColDef, {
                sortingOrder: ['asc', 'desc', null]
              })}
              theme="legacy"
              localeText={localeText}
              suppressHorizontalScroll={false}
              suppressColumnVirtualisation={false}
              animateRows={true}
              rowSelection={Object.assign({}, { 
                mode: 'multiRow',
                checkboxes: true,
                headerCheckbox: true
              })}
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[50, 100, 200, 500]}
              onGridReady={(params) => {
                setGridApi(params.api)
                setTimeout(() => {
                  params.api.sizeColumnsToFit()
                  
                  const translatePageSize = () => {
                    const pagingPanel = document.querySelector('.ag-paging-panel')
                    if (pagingPanel) {
                      const walker = document.createTreeWalker(
                        pagingPanel,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                      )
                      let node
                      while (node = walker.nextNode()) {
                        if (node.textContent.includes('Page Size')) {
                          node.textContent = node.textContent.replace('Page Size', 'Размер страницы')
                        }
                      }
                    }
                  }
                  
                  translatePageSize()
                  const interval = setInterval(translatePageSize, 100)
                  setTimeout(() => clearInterval(interval), 3000)
                }, 100)
              }}
              rowClassRules={Object.assign({}, {
                'ag-row-selected': (params) => params.node.selected,
              })}
              getRowStyle={(params) => {
                if (params.node.selected) {
                  return { backgroundColor: '#f0f9ff' }
                }
                return null
              }}
              multiSortKey="ctrl"
              loading={false}
              context={Object.assign({}, {
                replitMetadata: "component-metadata",
                componentName: "ProductTabs"
              })}
            />
          </div>
        )}
      </div>
    </div>
  )
}