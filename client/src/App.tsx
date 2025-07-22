import Navbar from '@components/Navbar'
import ProductTabs from '@components/ProductTabs'
import React from 'react'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <ProductTabs />
      </div>
    </div>
  );
}

export default App
