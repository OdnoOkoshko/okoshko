import React, { useState } from 'react'
import Navbar from './components/Navbar'
import ProductTabs from './components/ProductTabs'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-4xl mb-4">😢</div>
          <div className="text-lg font-bold text-red-600 mb-2">Произошла ошибка</div>
          <div className="text-gray-700 mb-4">{error.message || 'Что-то пошло не так.'}</div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>Перезагрузить</button>
        </div>
      </div>
    )
  }

  return (
    <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
  )
}

class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) this.props.onError(error)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('okoshko_token'))
  const [page, setPage] = useState('dashboard')

  const handleLogout = () => {
    localStorage.removeItem('okoshko_token')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between mb-4">
            <div className="space-x-2">
              <button
                className={`px-4 py-1 rounded ${page === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setPage('dashboard')}
              >Главная</button>
              <button
                className={`px-4 py-1 rounded ${page === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setPage('products')}
              >Товары</button>
            </div>
            <button onClick={handleLogout} className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Выйти</button>
          </div>
          {page === 'dashboard' && <Dashboard />}
          {page === 'products' && <ProductTabs />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
