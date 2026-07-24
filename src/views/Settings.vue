<template>
  <div class="settings-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4 space-y-6">
      <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('settings.title') }}</h1>

      <!-- 主题设置 -->
      <section class="ios-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ t('settings.themeMode') }}</h2>
            <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">{{ t('settings.switchTheme') }}</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <!-- 语言设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-3">{{ t('nav.language') }}</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="setLanguage(lang.code)"
            class="px-3 py-2 rounded-ios text-sm transition-all"
            :class="[
              currentLanguage === lang.code
                ? 'bg-ios-blue text-white'
                : 'bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-light-gray'
            ]"
          >
            {{ lang.nativeName }}
          </button>
        </div>
      </section>

      <!-- 睡眠定时器 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">😴 睡眠定时器</h2>
        
        <!-- 当前状态 -->
        <div v-if="playerStore.hasSleepTimer" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">定时器已启动</p>
              <p class="text-xs text-blue-600 dark:text-blue-400">剩余 {{ playerStore.sleepTimerRemaining }} 分钟后自动停止</p>
            </div>
            <button
              @click="clearSleepTimer"
              class="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>

        <!-- 设置选项 -->
        <div v-else>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <button
              v-for="time in sleepTimerOptions"
              :key="time.value"
              @click="setSleepTimer(time.value)"
              class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-ios-light-gray dark:hover:bg-dark-gray transition-colors"
            >
              <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ time.value }}</div>
              <div class="text-xs text-ios-gray dark:text-dark-secondary">{{ time.label }}</div>
            </button>
          </div>

          <!-- 自定义时间 -->
          <div class="flex gap-2">
            <input
              v-model.number="customMinutes"
              type="number"
              min="1"
              max="480"
              placeholder="自定义分钟"
              class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text"
            />
            <button
              @click="setSleepTimer(customMinutes)"
              :disabled="!customMinutes || customMinutes < 1"
              class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              设置
            </button>
          </div>
        </div>
      </section>

      <!-- 关于应用 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-3">{{ t('settings.aboutApp') }}</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.version') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">v{{ appVersion }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">构建时间</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ buildTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.deviceType') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ deviceType }}</span>
          </div>
        </div>
      </section>

      <!-- 检查更新 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-3">📦 检查更新</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm text-ios-gray dark:text-dark-secondary">当前版本 v{{ appVersion }}</span>
          <button
            @click="checkForUpdates"
            :disabled="isCheckingUpdate"
            class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {{ isCheckingUpdate ? '检查中...' : '检查更新' }}
          </button>
        </div>
        <div v-if="updateMessage" class="mt-3 p-3 rounded-lg" :class="updateMessageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'">
          {{ updateMessage }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import { useThemeStore } from '@/stores/theme'
import { useToastStore } from '@/stores/toast'
import ThemeToggle from '@/components/ThemeToggle.vue'
import packageInfo from '../../package.json'

const playerStore = usePlayerStore()
const languageStore = useLanguageStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const { t, languages, currentLanguage, setLanguage } = languageStore

const customMinutes = ref<number>(30)
const isCheckingUpdate = ref(false)
const updateMessage = ref('')
const updateMessageType = ref<'success' | 'warning' | ''>('')

// 版本信息
const appVersion = computed(() => {
  return packageInfo.version || '1.0.0'
})

const buildTime = computed(() => {
  // 从构建时注入的变量获取
  return import.meta.env.VITE_BUILD_TIME || new Date().toLocaleString('zh-CN')
})

const deviceType = computed(() => {
  const width = window.innerWidth
  if (width >= 1024) return t('settings.desktop')
  if (width >= 768) return t('settings.tablet')
  return t('settings.mobile')
})

const sleepTimerOptions = [
  { value: 15, label: '分钟' },
  { value: 30, label: '分钟' },
  { value: 45, label: '分钟' },
  { value: 60, label: '小时' },
  { value: 90, label: '分钟' },
  { value: 120, label: '小时' }
]

const setSleepTimer = (minutes: number) => {
  if (minutes > 0) {
    playerStore.setSleepTimer(minutes)
    const timeText = minutes >= 60 ? `${Math.floor(minutes / 60)}小时${minutes % 60 || ''}` : `${minutes}分钟`
    toastStore.showSuccess(`睡眠定时器已设置：${timeText}后停止播放`)
    updateMessage.value = ''
  }
}

const clearSleepTimer = () => {
  playerStore.clearSleepTimer()
  toastStore.showInfo('睡眠定时器已取消')
}

// 检查更新
const checkForUpdates = async () => {
  isCheckingUpdate.value = true
  updateMessage.value = ''
  updateMessageType.value = ''

  try {
    // 从 GitHub Releases 获取最新版本
    const response = await fetch('https://api.github.com/repos/moli-xia/global-radio/releases/latest')
    if (!response.ok) {
      throw new Error('无法获取更新信息')
    }
    const data = await response.json()
    const latestVersion = data.tag_name.replace('v', '')
    const currentVersion = appVersion.value

    if (latestVersion > currentVersion) {
      updateMessage.value = `发现新版本 v${latestVersion}！请前往 GitHub Releases 下载更新。`
      updateMessageType.value = 'success'
    } else {
      updateMessage.value = '当前已是最新版本。'
      updateMessageType.value = 'warning'
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    updateMessage.value = '检查更新失败，请稍后重试。'
    updateMessageType.value = 'warning'
  } finally {
    isCheckingUpdate.value = false
  }
}

onMounted(() => {
  // 设置页面标题
  document.title = '设置 - 全球电台'
})
</script>
