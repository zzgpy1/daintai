<template>
  <Teleport to="body">
    <div class="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2 max-w-sm mx-auto"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="pointer-events-auto"
        >
          <div
            class="px-4 py-3 rounded-ios shadow-lg flex items-center gap-3"
            :class="getToastClasses(toast.type)"
          >
            <component :is="getIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
            <button @click="toastStore.removeToast(toast.id)" class="p-1 rounded-full hover:bg-white/20">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const toastStore = useToastStore()

const getToastClasses = (type: string) => {
  switch (type) {
    case 'success': return 'bg-ios-green text-white'
    case 'error': return 'bg-ios-red text-white'
    case 'warning': return 'bg-orange-500 text-white'
    default: return 'bg-ios-blue text-white'
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationTriangleIcon
    default: return InformationCircleIcon
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
