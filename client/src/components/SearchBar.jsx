// SearchBar.jsx - компонент поля поиска

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400">🔍</span>
      </div>
      <input
        type="text"
        placeholder="Поиск..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-300 pl-9 pr-3 py-2 rounded text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}