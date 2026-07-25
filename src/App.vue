<template>
  <div class="app-container min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <!-- 背景特效 -->
    <BackgroundEffects />
    
    <!-- 顶部导航（桌面端） -->
    <TopNavigation v-if="!isMobile" />
    
    <!-- 主内容区域 -->
    <main 
      class="main-content"
      :class="{
        'pt-16 desktop:pt-20': !isMobile,
        'pb-32 mobile:pb-24': hasPlayer
      }"
    >
      <router-view v-slot="{ Component }">
        <transition
          mode="out-in"
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部播放栏（有播放时显示） -->
    <PlayerBar v-if="hasPlayer" />

    <!-- 底部导航（移动端） -->
    <BottomNavigation v-if="isMobile" />

    <!-- Toast提示 -->
    <ToastContainer />

    <!-- 更新通知 -->
    <UpdateNotification />

    <!-- 返回顶部按钮 -->
    <BackToTopButton />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'
import { platform } from '@/utils/platform'

import BackgroundEffects from '@/components/BackgroundEffects.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import TopNavigation from '@/components/TopNavigation.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import UpdateNotification from '@/components/UpdateNotification.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'

const playerStore = usePlayerStore()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

const isMobile = computed(() => platform.isMobile())
const hasPlayer = computed(() => !!playerStore.currentStation)

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  // 初始化设置
  settingsStore.init()
  // 恢复播放器状态
  playerStore.restoreFromStorage()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  min-height: 100dvh;
}

.main-content {
  min-height: calc(100vh - 88px);
  min-height: calc(100dvh - 88px);
}
</style>
