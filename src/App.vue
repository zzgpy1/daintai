<template>
  <div id="app" class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <router-view />
    <ToastContainer />
    <UpdateNotification />
    <!-- 底部导航 -->
    <BottomNav />
    <!-- 播放控制栏（覆盖在导航上方） -->
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import ToastContainer from '@/components/common/ToastContainer.vue'
import UpdateNotification from '@/components/common/UpdateNotification.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.init()
})
</script>

<style>
/* 为底部导航和播放器预留空间 */
#app {
  padding-bottom: 112px; /* 导航 56px + 播放器 56px */
}
</style>
