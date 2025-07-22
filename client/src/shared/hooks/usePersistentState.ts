import { useState, useEffect } from 'react'
import { saveToStorage, loadFromStorage } from '../storage'

// Универсальный хук для сохранения состояния в localStorage
export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Инициализация с загрузкой из localStorage
  const [value, setValue] = useState<T>(() => 
    loadFromStorage(key, defaultValue)
  )

  // Сохранение в localStorage при изменении
  useEffect(() => {
    saveToStorage(key, value)
  }, [key, value])

  return [value, setValue]
}