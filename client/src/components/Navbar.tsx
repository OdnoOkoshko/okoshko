// Navbar.tsx - компонент навигационного меню

import React from 'react'

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="text-xl font-bold text-gray-800">
              Okoshko
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Товары
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar