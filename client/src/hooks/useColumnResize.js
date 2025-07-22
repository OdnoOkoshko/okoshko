import { useState, useRef, useCallback, useEffect } from 'react'

export default function useColumnResize({ getColumnWidth, setColumnWidths }) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeColumn, setResizeColumn] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const dragStarted = useRef(false)

  const handleMouseDown = useCallback((e, columnKey) => {
    e.preventDefault()
    dragStarted.current = false
    setIsResizing(true)
    setResizeColumn(columnKey)
    setStartX(e.clientX)
    setStartWidth(parseInt(getColumnWidth(columnKey)))
    document.body.style.cursor = 'col-resize'
  }, [getColumnWidth])

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !resizeColumn) return
    dragStarted.current = true
    const diff = e.clientX - startX
    const newWidth = Math.max(50, startWidth + diff)
    setColumnWidths(prev => ({ ...prev, [resizeColumn]: newWidth }))
  }, [isResizing, resizeColumn, startX, startWidth, setColumnWidths])

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false)
      setResizeColumn(null)
      document.body.style.cursor = 'default'
      setTimeout(() => { dragStarted.current = false }, 50)
    }
  }, [isResizing])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return {
    handleMouseDown,
    isResizing,
    handleMouseMove,
    handleMouseUp,
    resizeColumn,
    dragStarted,
    startX,
    startWidth
  }
} 