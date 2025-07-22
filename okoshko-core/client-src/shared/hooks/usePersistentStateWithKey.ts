import { useState, useEffect } from 'react'
import { saveToStorage, loadFromStorage } from '../storage'

// Хук для состояний с динамическими ключами (например, зависящими от activeTab)
export function usePersistentStateWithKey<T>(
  getKey: () => string, 
  defaultValue: T,
  dependencies: any[]
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => 
    loadFromStorage(getKey(), defaultValue)
  )

  // Загрузка при изменении зависимостей (например, activeTab)
  useEffect(() => {
    setValue(loadFromStorage(getKey(), defaultValue))
  }, dependencies)

  // Сохранение при изменении значения
  useEffect(() => {
    saveToStorage(getKey(), value)
  }, [value, ...dependencies])

  return [value, setValue]
}