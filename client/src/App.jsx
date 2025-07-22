import Navbar from './components/Navbar'
import ProductTabs from './components/ProductTabs'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <ProductTabs />
      </div>
    </div>
  );
}
