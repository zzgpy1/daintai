<template>
  <nav class="bottom-navigation block md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-gray">
    <div class="flex items-center justify-around py-2 px-2 h-[72px]">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="nav-item flex flex-col items-center justify-center py-1 px-2 rounded-ios transition-all active:scale-95 flex-1"
        :class="{
          'text-ios-blue': $route.name === item.name,
          'text-ios-gray hover:text-ios-dark-gray dark:text-dark-secondary dark:hover:text-dark-text': $route.name !== item.name
        }"
      >
        <component :is="item.icon" class="w-6 h-6 mb-0.5 flex-shrink-0" />
        <span class="text-[10px] leading-tight text-center font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HomeIcon, MagnifyingGlassIcon, ClockIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const { t } = languageStore

const navigationItems = computed(() => [
  { name: 'Home', path: '/', label: t('nav.home'), icon: HomeIcon },
  { name: 'Search', path: '/search', label: t('nav.search'), icon: MagnifyingGlassIcon },
  { name: 'History', path: '/history', label: t('nav.history'), icon: ClockIcon },
  { name: 'Favorites', path: '/favorites', label: t('nav.favorites'), icon: HeartIcon }
])
</script>
