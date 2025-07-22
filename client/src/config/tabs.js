// tabs.js - константы конфигурации вкладок

export const TABLE_MAPPING = {
  moysklad: 'products_moysklad',
  ozon: 'products_ozon',
  wb: 'products_wb',
  yandex: 'products_yandex'
}

export const TAB_CONFIGS = [
  { 
    key: 'moysklad', 
    label: 'Мой Склад', 
    gradient: 'from-cyan-400 via-blue-400 to-blue-600' // Ярче и с переходом
  },
  { 
    key: 'ozon', 
    label: 'Озон', 
    gradient: 'from-blue-500 via-sky-400 to-blue-700' // Фирменный синий Ozon
  },
  { 
    key: 'wb', 
    label: 'Вайлдбериз', 
    gradient: 'from-fuchsia-500 via-pink-500 to-purple-700' // Яркий WB
  },
  { 
    key: 'yandex', 
    label: 'Яндекс Маркет', 
    gradient: 'from-yellow-400 via-orange-400 to-red-500' // Яркий Яндекс
  }
]