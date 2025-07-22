// useTabData.js - хук для управления загрузкой данных вкладок

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { TABLE_MAPPING } from '@/config/tabs'

export function useTabData() {
  const [tabData, setTabData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Загрузка данных из Supabase
  const loadData = async (tab) => {
    const tableName = TABLE_MAPPING[tab]
    let allData = []
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
      throw error
    }
  }

  // Функция для загрузки данных конкретной вкладки
  const fetchTabData = useCallback(async (activeTab) => {
    if (tabData[activeTab]) return // Данные уже загружены
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await loadData(activeTab)
      setTabData(prev => ({
        ...prev,
        [activeTab]: data
      }))
    } catch (err) {
      setError(err.message)
      setTabData(prev => ({
        ...prev,
        [activeTab]: []
      }))
    } finally {
      setLoading(false)
    }
  }, [tabData])

  return {
    tabData,
    loading,
    error,
    fetchTabData
  }
}