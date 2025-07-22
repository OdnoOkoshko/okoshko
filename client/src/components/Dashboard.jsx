import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { TAB_CONFIGS, TABLE_MAPPING } from '@/config/tabs'

export default function Dashboard() {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all(
      Object.entries(TABLE_MAPPING).map(async ([key, table]) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        if (error) throw error
        return [key, count]
      })
    )
      .then(results => {
        const obj = Object.fromEntries(results)
        setCounts(obj)
      })
      .catch(() => setError('Ошибка загрузки данных'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Сводка по товарам</h2>
      {loading && <div className="text-center text-gray-500">Загрузка...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TAB_CONFIGS.map(tab => (
            <div key={tab.key} className={`rounded-lg p-6 text-center shadow border bg-gradient-to-r ${tab.gradient} text-white`}>
              <div className="text-lg font-semibold mb-2">{tab.label}</div>
              <div className="text-3xl font-bold">{counts[tab.key] ?? '—'}</div>
              <div className="text-xs mt-1">товаров</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 