// SearchBar.jsx - компонент поля поиска

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <input
      type="text"
      placeholder="Поиск..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border border-gray-300 px-3 py-2 rounded text-sm w-64"
    />
  )
}