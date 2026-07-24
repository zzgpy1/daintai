<template>
  <div class="settings-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 移动端标题栏 -->
    <header class="mobile:block desktop:hidden sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between min-h-[44px]">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-ios-dark-gray dark:text-dark-text leading-tight max-w-[65%] break-words hyphens-auto flex-shrink-1 whitespace-normal">
          {{ t('settings.title') }}
        </h1>
      </div>
    </header>

    <!-- PC端标题栏 -->
    <div class="mobile:hidden desktop:block px-6 py-4 border-b border-gray-200 dark:border-dark-gray">
      <h1 class="text-3xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('settings.appSettings') }}</h1>
    </div>

    <div class="container-responsive py-6 space-y-6">
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

      <!-- 音频设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">{{ t('settings.audioSettings') }}</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-ios-gray dark:text-dark-secondary mb-2">{{ t('settings.volume') }}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="playerStore.volume"
              @input="setVolume"
              class="w-full accent-ios-blue"
            />
            <div class="flex justify-between text-xs text-ios-gray dark:text-dark-secondary mt-1">
              <span>{{ t('settings.mute') }}</span>
              <span>{{ Math.round(playerStore.volume * 100) }}%</span>
              <span>{{ t('settings.max') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 睡眠定时器 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">{{ t('settings.sleepTimer') }}</h2>

        <div class="space-y-4">
          <!-- 当前状态 -->
          <div v-if="playerStore.hasSleepTimer" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ t('settings.timerActive') }}</p>
                <p class="text-xs text-blue-600 dark:text-blue-400">
                  {{ t('settings.remaining') }} {{ playerStore.sleepTimerRemaining }} {{ t('settings.minutes') }}
                </p>
              </div>
              <button
                @click="clearSleepTimer"
                class="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                {{ t('settings.cancel') }}
              </button>
            </div>
          </div>

          <!-- 设置选项 -->
          <div v-else>
            <div class="grid grid-cols-4 gap-3">
              <button
                v-for="time in [15, 30, 45, 60]"
                :key="time"
                @click="setSleepTimer(time)"
                class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-ios-light-gray dark:hover:bg-dark-gray transition-colors"
              >
                <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ time }}</div>
                <div class="text-xs text-ios-gray dark:text-dark-secondary">{{ t('settings.minutes') }}</div>
              </button>
            </div>

            <!-- 自定义时间 -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-ios-gray dark:text-dark-secondary mb-2">{{ t('settings.customTime') }}</label>
              <div class="flex gap-2">
                <input
                  v-model.number="customMinutes"
                  type="number"
                  min="1"
                  max="480"
                  :placeholder="t('settings.enterMinutes')"
                  class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text"
                />
                <button
                  @click="setSleepTimer(customMinutes)"
                  :disabled="!customMinutes || customMinutes < 1"
                  class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ t('settings.setTimer') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 关于应用 - 版本号和更新 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">{{ t('settings.aboutApp') }}</h2>

        <div class="space-y-3">
          <!-- 版本号 -->
          <div class="flex justify-between items-center">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.version') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text font-medium">{{ version }}</span>
          </div>

          <!-- 平台信息 -->
          <div class="flex justify-between items-center">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.deviceType') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ platformName }}</span>
          </div>

          <!-- 更新检测 -->
          <div class="pt-2 border-t border-gray-200 dark:border-dark-gray">
            <div v-if="isCheckingUpdate" class="text-center py-2">
              <div class="inline-block w-5 h-5 border-2 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
              <span class="text-sm text-ios-gray dark:text-dark-secondary ml-2">检查更新中...</span>
            </div>

            <div v-else-if="hasUpdate" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700 dark:text-green-300">
                    🎉 发现新版本！
                  </p>
                  <p class="text-xs text-green-600 dark:text-green-400">
                    最新版本：{{ latestVersion }}
                  </p>
                </div>
                <button
                  @click="downloadUpdate"
                  class="px-4 py-2 bg-ios-blue text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  立即更新
                </button>
              </div>
            </div>

            <div v-else-if="updateChecked" class="p-3 bg-gray-50 dark:bg-dark-gray rounded-lg">
              <p class="text-sm text-ios-gray dark:text-dark-secondary text-center">
                ✅ 当前已是最新版本
              </p>
            </div>

            <button
              @click="checkForUpdates"
              :disabled="isCheckingUpdate"
              class="w-full mt-3 py-2 text-sm text-ios-blue font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ isCheckingUpdate ? '检查中...' : '检查更新' }}
            </button>
          </div>

          <!-- GitHub 链接 -->
          <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-dark-gray">
            <span class="text-ios-gray dark:text-dark-secondary">GitHub</span>
            <a
              href="https://github.com/moli-xia/global-radio"
              target="_blank"
              rel="noopener noreferrer"
              class="text-ios-blue hover:underline truncate text-sm max-w-[200px]"
            >
              moli-xia/global-radio
            </a>
          </div>
        </div>
      </section>

      <!-- 权限管理说明 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">{{ t('settings.permissionManagement') }}</h2>

        <div class="space-y-3">
          <div class="p-3 bg-gray-50 dark:bg-dark-gray rounded-lg">
            <div class="flex items-start gap-3">
              <InformationCircleIcon class="w-5 h-5 text-ios-blue flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm text-ios-dark-gray dark:text-dark-text">{{ t('settings.permissionInfo') }}</p>
                <p class="text-xs text-ios-gray dark:text-dark-secondary mt-1">{{ t('settings.permissionHint') }}</p>
              </div>
            </div>
          </div>

          <!-- 电量优化提示 -->
          <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-orange-700 dark:text-orange-300">{{ t('settings.batteryOptimization') }}</p>
                <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">{{ t('settings.batteryOptimizationHint') }}</p>
              </div>
            </div>
          </div>
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
import { InformationCircleIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()
const languageStore = useLanguageStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const { t } = languageStore

// ============================================
// 状态
// ============================================
const customMinutes = ref<number>(30)
const version = ref('v2026.07.24')
const platformName = ref('Web')
const isCheckingUpdate = ref(false)
const hasUpdate = ref(false)
const latestVersion = ref('')
const updateChecked = ref(false)

// ============================================
// 平台检测
// ============================================
const detectPlatform = () => {
  if (typeof window === 'undefined') {
    platformName.value = '未知'
    return
  }

  // 检测 Electron (桌面端)
  if ((window as any).electronAPI) {
    platformName.value = 'Windows 桌面版'
    return
  }

  // 检测 Capacitor (移动端)
  if ((window as any).Capacitor) {
    platformName.value = 'Android 手机版'
    return
  }

  // 检测 PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    platformName.value = 'PWA 应用'
    return
  }

  platformName.value = 'Web 版'
}

// ============================================
// 版本号获取
// ============================================
const getVersion = async () => {
  // 从 package.json 获取版本
  try {
    const response = await fetch('/package.json')
    if (response.ok) {
      const data = await response.json()
      version.value = data.version || 'v2026.07.24'
    }
  } catch (error) {
    // 使用默认版本
    version.value = 'v2026.07.24'
  }

  // 如果是在 Electron 中，从主进程获取
  if ((window as any).electronAPI) {
    try {
      const ver = await (window as any).electronAPI.getVersion()
      if (ver) version.value = ver
    } catch (error) {
      console.warn('无法从 Electron 获取版本')
    }
  }
}

// ============================================
// 更新检测
// ============================================
const checkForUpdates = async () => {
  isCheckingUpdate.value = true
  hasUpdate.value = false
  updateChecked.value = false

  try {
    // 从 GitHub API 获取最新 Release
    const response = await fetch(
      'https://api.github.com/repos/moli-xia/global-radio/releases/latest',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!response.ok) {
      // 如果 API 限流，尝试从镜像获取
      const fallbackResponse = await fetch(
        'https://api.github.com/repos/moli-xia/global-radio/releases/latest',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )
      if (!fallbackResponse.ok) throw new Error('API 请求失败')
      const data = await fallbackResponse.json()
      checkVersion(data)
      return
    }

    const data = await response.json()
    checkVersion(data)

  } catch (error) {
    console.error('检查更新失败:', error)
    toastStore.showError('检查更新失败，请稍后重试')
    updateChecked.value = false
  } finally {
    isCheckingUpdate.value = false
  }
}

const checkVersion = (data: any) => {
  const latestTag = data.tag_name || data.name || ''
  // 移除 'v' 前缀进行比较
  const currentVer = version.value.replace(/^v/, '')
  const latestVer = latestTag.replace(/^v/, '')

  if (latestVer && latestVer !== currentVer) {
    hasUpdate.value = true
    latestVersion.value = latestTag
  } else {
    hasUpdate.value = false
  }
  updateChecked.value = true
}

const downloadUpdate = () => {
  // 打开 GitHub Releases 页面
  window.open('https://github.com/moli-xia/global-radio/releases/latest', '_blank')
}

// ============================================
// 音量控制
// ============================================
const setVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  playerStore.setVolume(parseFloat(target.value))
}

// ============================================
// 睡眠定时器
// ============================================
const setSleepTimer = (minutes: number) => {
  if (minutes <= 0) return

  playerStore.setSleepTimer(minutes)
  const timeText = formatTimeText(minutes)
  const message = t('settings.timerSetSuccess').replace('{time}', timeText)
  toastStore.showSuccess(message)
}

const clearSleepTimer = () => {
  playerStore.clearSleepTimer()
  toastStore.showInfo(t('settings.timerCancelled'))
}

const formatTimeText = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes > 0) {
      return `${hours}${t('settings.hour')}${remainingMinutes}${t('settings.minute')}`
    }
    return `${hours}${t('settings.hour')}`
  }
  return `${minutes}${t('settings.minute')}`
}

// ============================================
// 生命周期
// ============================================
onMounted(() => {
  detectPlatform()
  getVersion()
})
</script>

<style scoped>
.ios-card {
  @apply bg-white dark:bg-dark-card rounded-ios shadow-ios border border-gray-100 dark:border-dark-gray transition-all duration-300;
}

.glass-effect {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
}

.dark .glass-effect {
  background: rgba(28, 28, 30, 0.8);
}

/* 自定义滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: #0056b3;
}

input[type="range"]::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

input[type="range"] {
  height: 6px;
  background: linear-gradient(to right, #007AFF 0%, #007AFF var(--value), #e5e7eb var(--value), #e5e7eb 100%);
  border-radius: 999px;
  outline: none;
  transition: background 0.3s;
}

.dark input[type="range"] {
  background: linear-gradient(to right, #007AFF 0%, #007AFF var(--value), #374151 var(--value), #374151 100%);
}
</style>
