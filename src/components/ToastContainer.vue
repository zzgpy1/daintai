<template>
  <Teleport to="body">
    <div class="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto mx-auto max-w-sm"
        >
          <div 
            class="px-4 py-3 rounded-ios shadow-ios-lg flex items-center gap-3"
            :class="getToastClasses(toast.type)"
          >
            <component :is="getIconComponent(toast.type)" class="w-5 h-5 flex-shrink-0" />
            <div class="flex-1">
              <p class="text-sm font-medium">{{ toast.message }}</p>
            </div>
            <button
              @click="removeToast(toast.id)"
              class="p-1 rounded-full transition-colors"
              :class="getButtonClasses(toast.type)"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const toasts = ref<Toast[]>([])

// 暴露方法给全局使用
window.showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  const id = Date.now().toString()
  toasts.value.push({ id, type, message })
  
  setTimeout(() => {
    removeToast(id)
  }, 3000)
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

const getIconComponent = (type: string) => {
  switch (type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationTriangleIcon
    default: return InformationCircleIcon
  }
}

const getToastClasses = (type: string) => {
  switch (type) {
    case 'success': return 'bg-ios-green text-white'
    case 'error': return 'bg-ios-red text-white'
    case 'warning': return 'bg-orange-500 text-white'
    default: return 'bg-ios-blue text-white'
  }
}

const getButtonClasses = (type: string) => {
  switch (type) {
    case 'success': return 'hover:bg-green-600'
    case 'error': return 'hover:bg-red-600'
    case 'warning': return 'hover:bg-orange-600'
    default: return 'hover:bg-blue-600'
  }
}

// 声明全局类型
declare global {
  interface Window {
    showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  }
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
