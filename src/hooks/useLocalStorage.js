import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore =
        typeof value === 'function' ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      console.warn(`useLocalStorage: could not write "${key}"`, e)
    }
  }, [key, storedValue])

  // Sync across browser tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== key) return
      try {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue)
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, initialValue])

  return [storedValue, setValue]
}
