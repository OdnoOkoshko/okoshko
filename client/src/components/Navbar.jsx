import { FiLogOut } from 'react-icons/fi'

export default function Navbar({ activePage, onNavigate, onLogout }) {
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              Okoshko
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-1 rounded ${activePage === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => onNavigate('dashboard')}
              >Главная</button>
              <button
                className={`px-4 py-1 rounded ${activePage === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => onNavigate('products')}
              >Товары</button>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 hover:text-red-700 transition text-sm font-medium"
            title="Выйти"
          >
            <FiLogOut /> Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}