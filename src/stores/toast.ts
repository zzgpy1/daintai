import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let idCounter = 0

  const addToast = (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
    const id = ++idCounter
    const toast: Toast = { id, type, message, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  const showSuccess = (message: string, duration?: number) => {
    return addToast(message, 'success', duration)
  }

  const showError = (message: string, duration?: number) => {
    return addToast(message, 'error', duration || 5000)
  }

  const showInfo = (message: string, duration?: number) => {
    return addToast(message, 'info', duration)
  }

  const showWarning = (message: string, duration?: number) => {
    return addToast(message, 'warning', duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
})
