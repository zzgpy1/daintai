<template>
  <div id="app" class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <!-- 背景特效 -->
    <BackgroundEffects />
    
    <!-- 顶部导航 (桌面端) -->
    <TopNavigation />
    
    <!-- 主内容区域 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 播放栏 -->
    <PlayerBar />
    
    <!-- 底部导航 (移动端) -->
    <BottomNavigation />
    
    <!-- Toast提示 -->
    <ToastContainer />
    
    <!-- 更新通知 -->
    <UpdateNotification />
    
    <!-- 返回顶部按钮 -->
    <BackToTopButton />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useLanguageStore } from '@/stores/language'
import { usePlayerStore } from '@/stores/player'
import { useHistoryStore } from '@/stores/history'
import { useFavoritesStore } from '@/stores/favorites'

// 组件导入
import BackgroundEffects from '@/components/BackgroundEffects.vue'
import TopNavigation from '@/components/TopNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import UpdateNotification from '@/components/UpdateNotification.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'

// Store实例
const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const playerStore = usePlayerStore()
const historyStore = useHistoryStore()
const favoritesStore = useFavoritesStore()

onMounted(async () => {
  // 初始化主题
  themeStore.init()
  
  // 初始化语言
  await languageStore.initLanguage()
  
  // 加载历史记录
  historyStore.loadHistory()
  
  // 加载收藏
  favoritesStore.loadFavorites()
  
  // 恢复播放器状态
  playerStore.restoreFromStorage()
  
  // 注册Service Worker（生产环境）
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
})
</script>

<style scoped>
.app-main {
  padding-top: 72px; /* TopNavigation高度 */
  padding-bottom: 88px; /* BottomNavigation高度 */
  min-height: 100vh;
}

@media (max-width: 767px) {
  .app-main {
    padding-top: 0; /* 移动端无顶部导航 */
    padding-bottom: 88px;
  }
}

@media (min-width: 1024px) {
  .app-main {
    padding-top: 72px;
    padding-bottom: 88px;
  }
}
</style>
