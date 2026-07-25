import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  // 添加Toast
  const addToast = (type: ToastType, message: string, duration: number = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const toast: Toast = {
      id,
      type,
      message,
      duration
    }
    
    toasts.value.push(toast)
    
    // 自动移除
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  // 移除Toast
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  // 快捷方法
  const showSuccess = (message: string, duration?: number) => {
    return addToast('success', message, duration)
  }

  const showError = (message: string, duration?: number) => {
    return addToast('error', message, duration)
  }

  const showWarning = (message: string, duration?: number) => {
    return addToast('warning', message, duration)
  }

  const showInfo = (message: string, duration?: number) => {
    return addToast('info', message, duration)
  }

  // 清空所有Toast
  const clearAll = () => {
    toasts.value = []
  }

  return {
    // 状态
    toasts,
    
    // 方法
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
})
