// sortData.js - утилиты для сортировки данных

export function sortData(data, sortConfig) {
  if (!sortConfig.column || !sortConfig.direction) {
    return data
  }

  const { column, direction } = sortConfig

  return [...data].sort((a, b) => {
    const aValue = a[column]
    const bValue = b[column]
    
    // Обработка null/undefined значений
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return direction === 'asc' ? 1 : -1
    if (bValue == null) return direction === 'asc' ? -1 : 1
    
    // Числовая сортировка
    const aNum = Number(aValue)
    const bNum = Number(bValue)
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return direction === 'asc' ? aNum - bNum : bNum - aNum
    }
    
    // Текстовая сортировка
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (direction === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
}