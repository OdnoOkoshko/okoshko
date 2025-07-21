import { useState } from 'react'

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('moysklad')

  // Мок-данные как запросил пользователь
  const mockData = {
    moysklad: [
      { id: 1, name: 'Товар МойСклад 1', price: '1500 ₽' },
      { id: 2, name: 'Товар МойСклад 2', price: '2300 ₽' },
      { id: 3, name: 'Товар МойСклад 3', price: '890 ₽' }
    ],
    ozon: [
      { id: 1, name: 'Товар Ozon 1', price: '1200 ₽' },
      { id: 2, name: 'Товар Ozon 2', price: '3400 ₽' }
    ],
    wb: [
      { id: 1, name: 'Товар WB 1', price: '750 ₽' },
      { id: 2, name: 'Товар WB 2', price: '1800 ₽' },
      { id: 3, name: 'Товар WB 3', price: '2100 ₽' }
    ],
    yandex: [
      { id: 1, name: 'Товар Яндекс 1', price: '950 ₽' },
      { id: 2, name: 'Товар Яндекс 2', price: '2600 ₽' }
    ]
  }

  const tabs = [
    { id: 'moysklad', name: 'МойСклад' },
    { id: 'ozon', name: 'Ozon' },
    { id: 'wb', name: 'WB' },
    { id: 'yandex', name: 'Яндекс' }
  ]

  return (
    <div className="w-full">
      {/* Вкладки */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Таблица */}
      <div className="mt-6">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Цена
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockData[activeTab].map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}