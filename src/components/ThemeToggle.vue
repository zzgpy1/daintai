<template>
  <button @click="themeStore.toggleMode()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors">
    <SunIcon v-if="themeStore.mode === 'light'" class="w-5 h-5 text-ios-gray" />
    <MoonIcon v-else class="w-5 h-5 text-dark-secondary" />
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()
</script>
