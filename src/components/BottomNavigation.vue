<template>
  <nav class="bottom-navigation block md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-gray">
    <div class="flex items-center justify-around py-3 px-2 h-[88px]">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="nav-item flex flex-col items-center justify-center py-2 px-1 rounded-ios transition-all active:scale-95 flex-1 min-w-0"
        :class="{
          'text-ios-blue': $route.name === item.name,
          'text-ios-gray hover:text-ios-dark-gray dark:text-dark-secondary dark:hover:text-dark-text': $route.name !== item.name
        }"
      >
        <component :is="item.icon" class="w-7 h-7 mb-1 flex-shrink-0" />
        <span class="nav-text text-center leading-tight max-w-full font-medium" :title="item.label">
          {{ item.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HomeIcon, ClockIcon, HeartIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { navigationConfig } from '@/config/navigation'

const navigationItems = computed(() => navigationConfig)
</script>

<style scoped>
.nav-text {
  font-size: clamp(0.6rem, 2.5vw, 0.75rem);
  line-height: 1.1;
  min-height: 2.2em;
  max-height: 2.2em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

@media (max-width: 320px) {
  .nav-text { font-size: clamp(0.5rem, 2vw, 0.625rem); line-height: 1.0; }
}

.nav-item {
  min-height: 4.75rem;
  max-height: 5.5rem;
  padding: 0.25rem 0.125rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-item .w-7.h-7.mb-1 {
  margin-bottom: 0.125rem;
  flex-shrink: 0;
}

@media (max-width: 360px) {
  .nav-item .w-7.h-7.mb-1 {
    width: 1.5rem;
    height: 1.5rem;
    margin-bottom: 0.0625rem;
  }
}

.bottom-navigation .flex.items-center.justify-around {
  height: 5.5rem;
  padding: 0.5rem 0.25rem;
}
</style>
