<template>
  <nav class="top-navigation hidden desktop:block fixed top-0 left-0 right-0 z-30 glass-effect border-b border-gray-200 dark:border-dark-gray">
    <div class="container-responsive px-6 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-ios-dark-gray dark:text-dark-text hover:text-ios-blue transition-colors">
          <div class="w-8 h-8 bg-gradient-to-br from-ios-blue to-ios-purple rounded-lg flex items-center justify-center">
            <RadioIcon class="w-5 h-5 text-white" />
          </div>
          全球电台
        </router-link>
        
        <!-- 导航菜单 -->
        <div class="flex items-center gap-6">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 px-3 py-2 rounded-ios transition-all hover:bg-gray-100 dark:hover:bg-dark-gray"
            :class="{
              'text-ios-blue font-medium': $route.path === item.path,
              'text-ios-gray hover:text-ios-dark-gray dark:text-dark-secondary dark:hover:text-dark-text': $route.path !== item.path
            }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
        
        <!-- 右侧操作 -->
        <div class="flex items-center gap-2">
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
import { useRoute } from 'vue-router'
import { HomeIcon, MagnifyingGlassIcon, HeartIcon, ClockIcon, Cog6ToothIcon, RadioIcon } from '@heroicons/vue/24/outline'
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'

const route = useRoute()

const navItems = computed(() => [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/favorites', label: '收藏', icon: HeartIcon },
  { path: '/history', label: '足迹', icon: ClockIcon }
])
</script>

<style scoped>
.glass-effect {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
}

.dark .glass-effect {
  background: rgba(28, 28, 30, 0.8);
}
</style>
