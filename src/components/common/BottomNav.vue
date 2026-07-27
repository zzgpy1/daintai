<template>
  <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-t border-gray-200 dark:border-dark-gray">
    <div class="flex items-center justify-around max-w-6xl mx-auto h-14 px-4">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center gap-0.5 text-xs transition-colors"
        :class="$route.path === item.path ? 'text-ios-blue' : 'text-ios-gray dark:text-dark-secondary'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  ClockIcon, 
  Cog6ToothIcon 
} from '@heroicons/vue/24/outline'

const route = useRoute()

const navItems = [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/search', label: '搜索', icon: MagnifyingGlassIcon },
  { path: '/favorites', label: '收藏', icon: HeartIcon },
  { path: '/history', label: '足迹', icon: ClockIcon },
  { path: '/settings', label: '设置', icon: Cog6ToothIcon }
]
</script>
