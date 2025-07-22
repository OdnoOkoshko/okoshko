import React from 'react'
import SearchBar from './SearchBar'
import { FiSettings, FiRotateCcw } from 'react-icons/fi'

export default function TableToolbar({
  searchTerm,
  setSearchTerm,
  handleResetSettings,
  setShowColumnMenu,
  showColumnMenu,
  buttonRef,
  children
}) {
  return (
    <div className="grid grid-cols-3 items-center mb-3">
      {/* Левая часть - счетчик записей */}
      <div className="text-sm text-gray-600">
        {children}
      </div>
      {/* Центральная часть - поиск */}
      <div className="flex justify-center">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      {/* Правая часть - кнопки управления */}
      <div className="flex justify-end items-center space-x-1">
        <button
          onClick={handleResetSettings}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
          title="Сбросить настройки таблицы"
        >
          <FiRotateCcw size={18} />
        </button>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Управление столбцами"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </div>
    </div>
  )
} 