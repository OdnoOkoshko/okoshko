import { useState, useCallback } from 'react'

export function isImageField(key) {
  const keyLower = key.toLowerCase()
  return keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('picture')
}

export function isLinkField(key) {
  const keyLower = key.toLowerCase()
  return keyLower.includes('link') || keyLower.includes('url')
}

export function useImageError() {
  const [brokenImages, setBrokenImages] = useState(new Set())
  const handleImageError = useCallback((imageUrl) => {
    setBrokenImages(prev => new Set([...prev, imageUrl]))
  }, [])
  return { brokenImages, handleImageError }
} 