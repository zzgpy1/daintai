<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
    :title="currentModeText"
  >
    <SunIcon v-if="isLight" class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
    <MoonIcon v-else class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()

const isLight = computed(() => themeStore.mode === 'light' || themeStore.mode === 'system')
const currentModeText = computed(() => {
  return themeStore.mode === 'light' ? '切换到暗色模式' : '切换到明亮模式'
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>
