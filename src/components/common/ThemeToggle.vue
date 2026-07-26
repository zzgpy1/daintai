<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
    :title="theme === 'light' ? '切换到暗色模式' : '切换到明亮模式'"
  >
    <SunIcon v-if="theme === 'light'" class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
    <MoonIcon v-else class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme)

const toggleTheme = () => {
  settingsStore.toggleTheme()
}
</script>
