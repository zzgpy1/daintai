<template>
  <div class="settings-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 标题栏 -->
    <div class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          @click="$router.push('/')"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
        </button>
        <h1 class="text-lg font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('nav.settings') }}</h1>
      </div>
    </div>

    <div class="container-responsive py-4 space-y-6">
      <!-- 语言设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.language') }}
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="lang in languageStore.supportedLanguages"
            :key="lang.code"
            @click="languageStore.setLanguage(lang.code)"
            class="p-3 rounded-ios text-center transition-all"
            :class="[
              languageStore.currentLanguage === lang.code
                ? 'bg-ios-blue text-white'
                : 'bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-light-gray'
            ]"
          >
            {{ lang.nativeName }}
          </button>
        </div>
      </section>

      <!-- 主题设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.themeMode') }}
        </h2>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="mode in themeOptions"
            :key="mode.value"
            @click="themeStore.setTheme(mode.value)"
            class="p-3 rounded-ios text-center transition-all"
            :class="[
              themeStore.theme === mode.value
                ? 'bg-ios-blue text-white'
                : 'bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-light-gray'
            ]"
          >
            <component :is="mode.icon" class="w-5 h-5 mx-auto mb-1" />
            <span class="text-xs">{{ mode.label }}</span>
          </button>
        </div>
      </section>

      <!-- 播放设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.playbackSettings') }}
        </h2>
        
        <div class="space-y-4">
          <!-- 音量 -->
          <div>
            <label class="block text-sm font-medium text-ios-gray dark:text-dark-secondary mb-2">
              {{ $t('settings.volume') }}
            </label>
            <div class="flex items-center gap-3">
              <SpeakerWaveIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="playerStore.volume"
                @input="onVolumeChange"
                class="flex-1 accent-ios-blue"
              />
              <span class="text-sm font-medium text-ios-dark-gray dark:text-dark-text min-w-[40px]">
                {{ Math.round(playerStore.volume * 100) }}%
              </span>
            </div>
          </div>
          
          <!-- 自动播放下一首 -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-ios-dark-gray dark:text-dark-text">{{ $t('settings.autoPlayNext') }}</span>
              <p class="text-xs text-ios-gray dark:text-dark-secondary">{{ $t('settings.autoPlayNextDesc') }}</p>
            </div>
            <button
              @click="settingsStore.autoPlayNext = !settingsStore.autoPlayNext"
              class="relative w-12 h-7 rounded-full transition-colors"
              :class="settingsStore.autoPlayNext ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-dark-gray'"
            >
              <span
                class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform"
                :class="settingsStore.autoPlayNext ? 'translate-x-5' : 'translate-x-0.5'"
              ></span>
            </button>
          </div>
        </div>
      </section>

      <!-- 睡眠定时器 -->
      <section class="ios-card p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">
            {{ $t('settings.sleepTimer') }}
          </h2>
          <SleepTimer />
        </div>
        <p class="text-sm text-ios-gray dark:text-dark-secondary">
          {{ $t('settings.sleepTimerDesc') }}
        </p>
      </section>

      <!-- 更新设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.updateSettings') }}
        </h2>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-ios-dark-gray dark:text-dark-text">{{ $t('settings.autoUpdate') }}</span>
              <p class="text-xs text-ios-gray dark:text-dark-secondary">{{ $t('settings.autoUpdateDesc') }}</p>
            </div>
            <button
              @click="settingsStore.enableAutoUpdate = !settingsStore.enableAutoUpdate"
              class="relative w-12 h-7 rounded-full transition-colors"
              :class="settingsStore.enableAutoUpdate ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-dark-gray'"
            >
              <span
                class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform"
                :class="settingsStore.enableAutoUpdate ? 'translate-x-5' : 'translate-x-0.5'"
              ></span>
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <span class="text-ios-dark-gray dark:text-dark-text">{{ $t('settings.checkForUpdates') }}</span>
              <p class="text-xs text-ios-gray dark:text-dark-secondary">{{ $t('settings.currentVersion') }} {{ appVersion }}</p>
            </div>
            <button
              @click="checkForUpdates"
              class="px-4 py-2 bg-ios-blue text-white rounded-ios text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {{ $t('settings.check') }}
            </button>
          </div>
        </div>
      </section>

      <!-- 关于 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.aboutApp') }}
        </h2>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ $t('settings.version') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">v{{ appVersion }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ $t('settings.platform') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ platformInfo }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ $t('settings.apiStatus') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">
              <span class="inline-block w-2 h-2 rounded-full mr-1" :class="apiStatus ? 'bg-green-500' : 'bg-red-500'"></span>
              {{ apiStatus ? $t('settings.online') : $t('settings.offline') }}
            </span>
          </div>
          
          <div class="pt-3 border-t border-gray-200 dark:border-dark-gray">
            <a
              href="https://github.com/your-repo/global-radio"
              target="_blank"
              rel="noopener noreferrer"
              class="text-ios-blue hover:underline text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>
      
      <!-- 数据管理 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.dataManagement') }}
        </h2>
        
        <div class="space-y-3">
          <button
            @click="clearCache"
            class="w-full p-3 text-left rounded-ios bg-gray-100 dark:bg-dark-gray hover:bg-gray-200 dark:hover:bg-dark-light-gray transition-colors"
          >
            <span class="text-ios-dark-gray dark:text-dark-text">{{ $t('settings.clearCache') }}</span>
            <p class="text-xs text-ios-gray dark:text-dark-secondary">{{ $t('settings.clearCacheDesc') }}</p>
          </button>
          
          <button
            @click="resetSettings"
            class="w-full p-3 text-left rounded-ios bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <span class="text-ios-red">{{ $t('settings.resetSettings') }}</span>
            <p class="text-xs text-ios-red/70">{{ $t('settings.resetSettingsDesc') }}</p>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLanguageStore } from '@/stores/language'
import { useSettingsStore } from '@/stores/settings'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import { useRadioStore } from '@/stores/radio'
import { platform } from '@/utils/platform'

import {
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon
} from '@heroicons/vue/24/outline'

import SleepTimer from '@/components/SleepTimer.vue'

const router = useRouter()
const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const settingsStore = useSettingsStore()
const playerStore = usePlayerStore()
const toastStore = useToastStore()
const radioStore = useRadioStore()

// 主题选项
const themeOptions = [
  { value: 'light', label: '明亮', icon: SunIcon },
  { value: 'dark', label: '暗色', icon: MoonIcon },
  { value: 'system', label: '系统', icon: ComputerDesktopIcon }
]

// 版本信息
const appVersion = ref('2.0.0')
const apiStatus = ref(true)

const platformInfo = computed(() => {
  const os = platform.getOS()
  const osMap: Record<string, string> = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux',
    android: 'Android',
    ios: 'iOS',
    unknown: '未知'
  }
  return osMap[os] || '未知'
})

// 音量控制
const onVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  playerStore.setVolume(parseFloat(target.value))
}

// 检查更新
const checkForUpdates = () => {
  toastStore.showInfo('检查更新中...')
  // 实际更新逻辑
}

// 清除缓存
const clearCache = () => {
  radioStore.clearCache?.()
  toastStore.showSuccess('缓存已清除')
}

// 重置设置
const resetSettings = () => {
  if (confirm('确定要重置所有设置吗？')) {
    settingsStore.resetSettings()
    toastStore.showSuccess('设置已重置')
  }
}

// 获取版本
const getVersion = async () => {
  try {
    if (window.electronAPI) {
      appVersion.value = await window.electronAPI.getVersion()
    }
  } catch (error) {
    // 使用package.json版本
    const pkg = await import('../../package.json')
    appVersion.value = pkg.version
  }
}

// 检查API状态
const checkApiStatus = async () => {
  try {
    const { radioAPI } = await import('@/services/radioApi')
    const status = await radioAPI.getAPIStatus()
    apiStatus.value = status.available
  } catch {
    apiStatus.value = false
  }
}

onMounted(() => {
  getVersion()
  checkApiStatus()
})
</script>
