// useClickOutside.ts - хук для обработки кликов вне элементов

import { useEffect, RefObject } from 'react'

export function useClickOutside(
  refs: RefObject<HTMLElement>[], 
  callback: () => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Проверяем, что клик произошел вне всех переданных refs
      const isOutside = refs.every(ref => 
        ref.current && !ref.current.contains(event.target as Node)
      )
      
      if (isOutside) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs, callback])
}