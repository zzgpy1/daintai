<template>
  <nav class="bottom-navigation block md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-gray">
    <div class="flex items-center justify-around py-2 px-1 h-[72px]">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="nav-item flex flex-col items-center justify-center py-1 px-1 rounded-ios transition-all active:scale-95 flex-1 min-w-0"
        :class="{
          'text-ios-blue': $route.name === item.name,
          'text-ios-gray hover:text-ios-dark-gray dark:text-dark-secondary dark:hover:text-dark-text': $route.name !== item.name
        }"
      >
        <component
          :is="item.icon"
          class="w-6 h-6 mb-0.5 flex-shrink-0"
          :class="{
            'fill-current': $route.name === item.name && item.fillWhenActive
          }"
        />
        <span class="nav-text text-center leading-tight max-w-full text-xs font-medium">
          {{ item.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  HomeIcon,
  ClockIcon,
  HeartIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const navigationItems = computed(() => [
  {
    name: 'Home',
    path: '/',
    label: languageStore.t('nav.home'),
    icon: HomeIcon,
    fillWhenActive: false
  },
  {
    name: 'History',
    path: '/history',
    label: languageStore.t('nav.history'),
    icon: ClockIcon,
    fillWhenActive: false
  },
  {
    name: 'Favorites',
    path: '/favorites',
    label: languageStore.t('nav.favorites'),
    icon: HeartIcon,
    fillWhenActive: true
  },
  {
    name: 'Settings',
    path: '/settings',
    label: languageStore.t('nav.settings'),
    icon: Cog6ToothIcon,
    fillWhenActive: false
  }
])
</script>

<style scoped>
.nav-text {
  font-size: clamp(0.55rem, 2vw, 0.7rem);
  line-height: 1.1;
  min-height: 2em;
  max-height: 2em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  overflow-wrap: break-word;
  word-break: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.nav-item {
  min-height: 4rem;
  max-height: 4.5rem;
  padding: 0.125rem 0.125rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-item .w-6.h-6.mb-0.5 {
  margin-bottom: 0.0625rem;
  flex-shrink: 0;
}

@media (max-width: 360px) {
  .nav-item .w-6.h-6.mb-0.5 {
    width: 1.25rem;
    height: 1.25rem;
  }
  .nav-text {
    font-size: 0.5rem;
  }
}

.bottom-navigation .flex.items-center.justify-around {
  height: 4.5rem;
  padding: 0.25rem 0.125rem;
}
</style>
