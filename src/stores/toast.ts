import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let idCounter = 0

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = ++idCounter
    const newToast: Toast = { ...toast, id, duration: toast.duration || 3000 }
    toasts.value.push(newToast)

    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const clearAll = () => {
    toasts.value = []
  }

  const showSuccess = (message: string) => addToast({ type: 'success', message })
  const showError = (message: string) => addToast({ type: 'error', message })
  const showWarning = (message: string) => addToast({ type: 'warning', message })
  const showInfo = (message: string) => addToast({ type: 'info', message })

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
