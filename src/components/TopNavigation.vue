<template>
  <nav class="top-navigation hidden desktop:block fixed top-0 left-0 right-0 z-30 glass-effect border-b border-gray-200 dark:border-dark-gray">
    <div class="container-responsive px-6 py-3">
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-ios-dark-gray dark:text-dark-text hover:text-ios-blue transition-colors">
          <span>📻 {{ t('home.title') }}</span>
        </router-link>
        <div class="flex items-center gap-6">
          <router-link v-for="item in navItems" :key="item.name" :to="item.path" class="text-sm font-medium transition-colors"
            :class="$route.name === item.name ? 'text-ios-blue' : 'text-ios-gray hover:text-ios-dark-gray dark:text-dark-secondary dark:hover:text-dark-text'">
            {{ item.label }}
          </router-link>
        </div>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'

const languageStore = useLanguageStore()
const { t } = languageStore

const navItems = computed(() => [
  { name: 'Home', path: '/', label: t('nav.home') },
  { name: 'Search', path: '/search', label: t('nav.search') },
  { name: 'Favorites', path: '/favorites', label: t('nav.favorites') },
  { name: 'History', path: '/history', label: t('nav.history') },
  { name: 'Settings', path: '/settings', label: t('nav.settings') }
])
</script>
