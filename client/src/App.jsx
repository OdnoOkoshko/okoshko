import Navbar from './components/Navbar'
import ProductTabs from './components/ProductTabs'
import { useState } from 'react'

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
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8">
          <ProductTabs />
        </div>
      </div>
    </ErrorBoundary>
  );
}
