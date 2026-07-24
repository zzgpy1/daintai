<template>
  <nav class="top-navigation hidden desktop:block fixed top-0 left-0 right-0 z-30 glass-effect border-b border-gray-200 dark:border-dark-gray">
    <div class="container-responsive px-6 py-4">
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-ios-dark-gray dark:text-dark-text hover:text-ios-blue transition-colors">
          <div class="w-8 h-8 bg-gradient-to-br from-ios-blue to-ios-purple rounded-lg flex items-center justify-center">
            <RadioIcon class="w-5 h-5 text-white" />
          </div>
          {{ t('home.title') }}
        </router-link>

        <div class="flex items-center gap-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.path"
            class="flex items-center gap-2 px-3 py-2 rounded-ios transition-all hover:bg-gray-100 dark:hover:bg-dark-gray"
            :class="{
              'text-ios-blue font-medium': $route.name === item.name,
              'text-ios-gray hover:text-ios-dark-gray dark:text-dark-secondary dark:hover:text-dark-text': $route.name !== item.name
            }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>

        <div class="flex items-center gap-3">
          <button @click="$router.push('/search')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors">
            <MagnifyingGlassIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
          </button>
          <LanguageToggle />
          <ThemeToggle />
          <button @click="$router.push('/settings')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors">
            <Cog6ToothIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HomeIcon, MagnifyingGlassIcon, ClockIcon, HeartIcon, Cog6ToothIcon, RadioIcon } from '@heroicons/vue/24/outline'
import { useLanguageStore } from '@/stores/language'
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'

const { t } = useLanguageStore()

const navigationItems = computed(() => [
  { name: 'Home', path: '/', label: t('nav.home'), icon: HomeIcon },
  { name: 'Favorites', path: '/favorites', label: t('nav.favorites'), icon: HeartIcon },
  { name: 'History', path: '/history', label: t('nav.history'), icon: ClockIcon }
])
</script>
