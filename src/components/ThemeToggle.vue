<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
    :title="currentThemeLabel"
  >
    <component :is="themeIcon" class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()

const themeIcon = computed(() => {
  switch (themeStore.mode) {
    case 'light': return SunIcon
    case 'dark': return MoonIcon
    default: return ComputerDesktopIcon
  }
})

const currentThemeLabel = computed(() => {
  const labels = {
    light: '明亮模式',
    dark: '暗色模式',
    system: '跟随系统'
  }
  return `当前: ${labels[themeStore.mode]}`
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>
