import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2)
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  // 便捷方法
  const showSuccess = (message: string, duration?: number) => addToast(message, 'success', duration)
  const showError = (message: string, duration?: number) => addToast(message, 'error', duration)
  const showWarning = (message: string, duration?: number) => addToast(message, 'warning', duration)
  const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration)

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
