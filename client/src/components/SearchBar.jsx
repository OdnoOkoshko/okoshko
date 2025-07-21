// SearchBar.jsx - компонент поля поиска с debounce
import { useState, useEffect } from 'react'

export default function SearchBar({ searchTerm, setSearchTerm }) {
  const [inputValue, setInputValue] = useState(searchTerm)

  // Debounce эффект
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, setSearchTerm])

  // Синхронизация с внешним значением (для сброса поиска)
  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400">🔍</span>
      </div>
      <input
        type="text"
        placeholder="Поиск..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border border-gray-300 pl-9 pr-3 py-2 rounded text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}