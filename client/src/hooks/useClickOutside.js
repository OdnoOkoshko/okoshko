// useClickOutside.js - хук для обработки кликов вне элементов

import { useEffect } from 'react'

export function useClickOutside(refs, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Проверяем, что клик произошел вне всех переданных refs
      const isOutside = refs.every(ref => 
        ref.current && !ref.current.contains(event.target)
      )
      
      if (isOutside) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs, callback])
}