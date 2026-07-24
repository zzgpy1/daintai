<template>
  <div class="settings-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4 space-y-6">
      <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('settings.title') }}</h1>

      <section class="ios-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ t('settings.themeMode') }}</h2>
            <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">{{ t('settings.switchTheme') }}</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-3">😴 睡眠定时器</h2>
        
        <div v-if="playerStore.hasSleepTimer" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">定时器已启动</p>
              <p class="text-xs text-blue-600 dark:text-blue-400">剩余 {{ playerStore.sleepTimerRemaining }} 分钟后自动停止</p>
            </div>
            <button @click="clearSleepTimer" class="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
              取消
            </button>
          </div>
        </div>

        <div v-else>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <button v-for="time in [15, 30, 45, 60, 90, 120]" :key="time" @click="setSleepTimer(time)" class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-ios-light-gray dark:hover:bg-dark-gray transition-colors">
              <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ time }}</div>
              <div class="text-xs text-ios-gray dark:text-dark-secondary">分钟</div>
            </button>
          </div>
          <div class="flex gap-2">
            <input v-model.number="customMinutes" type="number" min="1" max="480" placeholder="自定义分钟" class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text" />
            <button @click="setSleepTimer(customMinutes)" :disabled="!customMinutes || customMinutes < 1" class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">设置</button>
          </div>
        </div>
      </section>

      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-3">{{ t('settings.aboutApp') }}</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.version') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ appVersion }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.deviceType') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ deviceType }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import { useToastStore } from '@/stores/toast'
import ThemeToggle from '@/components/ThemeToggle.vue'
import packageInfo from '../../package.json'

const playerStore = usePlayerStore()
const languageStore = useLanguageStore()
const toastStore = useToastStore()
const { t } = languageStore

const customMinutes = ref<number>(30)

const appVersion = computed(() => packageInfo.version || '1.0.0')

const deviceType = computed(() => {
  const width = window.innerWidth
  if (width >= 1024) return t('settings.desktop')
  if (width >= 768) return t('settings.tablet')
  return t('settings.mobile')
})

const setSleepTimer = (minutes: number) => {
  if (minutes > 0) {
    playerStore.setSleepTimer(minutes)
    toastStore.showSuccess(`睡眠定时器已设置：${minutes}分钟后停止`)
  }
}

const clearSleepTimer = () => {
  playerStore.clearSleepTimer()
  toastStore.showInfo('睡眠定时器已取消')
}
</script>
