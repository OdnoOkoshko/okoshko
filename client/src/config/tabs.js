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
    gradient: 'from-cyan-300 via-sky-400 to-blue-400' // Более голубой
  },
  { 
    key: 'ozon', 
    label: 'Озон', 
    gradient: 'from-blue-700 via-blue-600 to-indigo-800' // Более насыщенно синий
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