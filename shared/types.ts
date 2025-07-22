// types.ts - общие типы для проекта Okoshko

export interface Product {
  id: string | number
  name: string
  code?: string
  price?: number | string
  barcode?: string
  image?: string
  link?: string
  url?: string
  [key: string]: any
}

export interface TabConfig {
  key: string
  label: string
  gradient: string
}

export interface SortConfig {
  column: string | null
  direction: 'asc' | 'desc' | null
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  pageData: Product[]
  startItem: number
  endItem: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationControls {
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPrevPage: () => void
  setCurrentPage: (page: number) => void
}

export interface TabData {
  [key: string]: Product[]
}

export interface UseTabDataReturn {
  tabData: TabData
  loading: boolean
  error: string | null
  fetchTabData: (activeTab: string) => void
}

export interface UsePaginationReturn extends PaginationData, PaginationControls {}

export type TableName = 'products_moysklad' | 'products_ozon' | 'products_wb' | 'products_yandex'

export interface TableMapping {
  [key: string]: TableName
}