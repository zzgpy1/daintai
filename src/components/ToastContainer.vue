<template>
  <Teleport to="body">
    <div class="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto mx-auto max-w-sm px-4 py-3 bg-ios-blue text-white rounded-ios shadow-ios-lg flex items-center gap-3">
        <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="p-1 rounded-full hover:bg-blue-600 transition-colors">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const { toasts, removeToast } = useToastStore()
</script>
