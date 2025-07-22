import React from 'react'

export default function ColumnMenu({
  allColumns,
  hiddenColumns,
  toggleColumn,
  itemsPerPage,
  setItemsPerPage,
  menuRef
}) {
  return (
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
      <div className="border-t border-gray-200 my-3"></div>
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
  )
} 