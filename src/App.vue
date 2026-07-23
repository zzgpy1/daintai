<template>
  <div id="app" class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <!-- 顶部导航（桌面端） -->
    <TopNavigation />
    
    <!-- 主内容区域 -->
    <main class="pt-0 desktop:pt-16 pb-24 md:pb-0">
      <router-view v-slot="{ Component }">
        <transition
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

    <!-- 底部播放栏 -->
    <PlayerBar />
    
    <!-- 底部导航（移动端） -->
    <BottomNavigation />
    
    <!-- 回到顶部按钮 -->
    <BackToTopButton />
    
    <!-- Toast 通知容器 -->
    <ToastContainer />
    
    <!-- 顶部装饰层 -->
    <TopLayerEffects />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import TopNavigation from '@/components/TopNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import TopLayerEffects from '@/components/TopLayerEffects.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
/* 全局样式在 style.css 中定义 */
</style>
