// useTabData.ts - хук для управления загрузкой данных вкладок

import { useState } from 'react'
import { supabase } from '../../client/src/lib/supabaseClient'
import { TABLE_MAPPING } from '@shared/config/tabs'
import type { UseTabDataReturn, Product, TabData, TableName } from '@shared/types'

export function useTabData(): UseTabDataReturn {
  const [tabData, setTabData] = useState<TabData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузка данных из Supabase
  const loadData = async (tab: string): Promise<Product[]> => {
    const tableName: TableName = TABLE_MAPPING[tab]
    let allData: Product[] = []
    let from = 0
    const chunkSize = 1000
    
    try {
      while (true) {
        const { data: chunk, error: chunkError } = await supabase
          .from(tableName)
          .select('*')
          .range(from, from + chunkSize - 1)
        
        if (chunkError) {
          throw new Error('Ошибка при загрузке данных')
        }
        
        if (!chunk || chunk.length === 0) break
        
        allData = [...allData, ...chunk]
        if (chunk.length < chunkSize) break
        from += chunkSize
      }
      
      return allData
    } catch (error) {
      throw new Error('Ошибка при загрузке данных')
    }
  }

  // Функция для загрузки данных конкретной вкладки
  const fetchTabData = async (activeTab: string): Promise<void> => {
    if (tabData[activeTab]) return // Данные уже загружены
    
    let isCurrent = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await loadData(activeTab)
        if (!isCurrent) return
        
        setTabData(prev => ({
          ...prev,
          [activeTab]: data
        }))
      } catch (err) {
        if (!isCurrent) return
        
        setError((err as Error).message || 'Ошибка при загрузке данных')
        setTabData(prev => ({
          ...prev,
          [activeTab]: []
        }))
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    fetchData()
  }

  return {
    tabData,
    loading,
    error,
    fetchTabData
  }
}