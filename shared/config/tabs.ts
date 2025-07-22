// tabs.ts - константы конфигурации вкладок

import type { TableMapping, TabConfig } from '@shared/types'

export const TABLE_MAPPING: TableMapping = {
  moysklad: 'products_moysklad',
  ozon: 'products_ozon',
  wb: 'products_wb',
  yandex: 'products_yandex'
}

export const TAB_CONFIGS: TabConfig[] = [
  { 
    key: 'moysklad', 
    label: 'Мой Склад', 
    gradient: 'from-cyan-400 to-blue-500' 
  },
  { 
    key: 'ozon', 
    label: 'Озон', 
    gradient: 'from-blue-500 to-blue-600' 
  },
  { 
    key: 'wb', 
    label: 'Вайлдбериз', 
    gradient: 'from-purple-500 to-purple-600' 
  },
  { 
    key: 'yandex', 
    label: 'Яндекс Маркет', 
    gradient: 'from-yellow-400 to-orange-500' 
  }
]