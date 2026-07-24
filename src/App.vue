<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <AnimatedBackground />
    <TopNavigation />
    <main class="pt-16 mobile:pt-0">
      <router-view />
    </main>
    <PlayerBar />
    <BottomNavigation />
    <BackToTopButton />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import TopNavigation from '@/components/TopNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useThemeStore } from '@/stores/theme'
import { usePlayerStore } from '@/stores/player'

const themeStore = useThemeStore()
const playerStore = usePlayerStore()

onMounted(() => {
  themeStore.initTheme()
  playerStore.restoreFromStorage()
})
</script>
