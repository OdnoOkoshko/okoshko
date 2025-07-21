import SupabaseTest from './components/SupabaseTest'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Okoshko - Единое окно заказов</h1>
        <SupabaseTest />
      </div>
    </div>
  );
}
