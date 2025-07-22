// usePagination.ts - хук для управления пагинацией данных

import { useState, useMemo, useEffect } from 'react'
import type { Product, UsePaginationReturn } from '@shared/types'

export function usePagination(data: Product[], itemsPerPage: number = 100): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1)

  // Сброс на первую страницу при изменении данных
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length])

  const paginationData = useMemo(() => {
    const totalCount = data.length
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const start = (currentPage - 1) * itemsPerPage
    const end = currentPage * itemsPerPage
    const pageData = data.slice(start, end)
    const startItem = start + 1
    const endItem = Math.min(end, totalCount)

    return {
      currentPage,
      totalPages,
      totalCount,
      pageData,
      startItem,
      endItem,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  }, [data, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  return {
    ...paginationData,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setCurrentPage
  }
}