import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let idCounter = 0

  const showToast = (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
    const id = ++idCounter
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const showSuccess = (message: string, duration?: number) => {
    return showToast(message, 'success', duration)
  }

  const showError = (message: string, duration?: number) => {
    return showToast(message, 'error', duration)
  }

  const showWarning = (message: string, duration?: number) => {
    return showToast(message, 'warning', duration)
  }

  const showInfo = (message: string, duration?: number) => {
    return showToast(message, 'info', duration)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll
  }
})
