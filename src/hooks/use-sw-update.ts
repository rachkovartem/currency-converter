import { useState, useEffect } from 'react'

interface UseSwUpdateResult {
  updateAvailable: boolean
  applyUpdate: () => void
}

export function useSwUpdate(): UseSwUpdateResult {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const sw = navigator.serviceWorker
    const hadController = !!sw.controller

    const handler = () => {
      if (hadController) {
        setUpdateAvailable(true)
      }
    }

    sw.addEventListener('controllerchange', handler)

    return () => {
      sw.removeEventListener('controllerchange', handler)
    }
  }, [])

  const applyUpdate = () => {
    if (updateAvailable) {
      window.location.reload()
    }
  }

  return { updateAvailable, applyUpdate }
}
