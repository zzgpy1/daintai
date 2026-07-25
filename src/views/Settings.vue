<template>
  <div class="settings-page">
    <!-- 标题栏 -->
    <header class="sticky top-0 z-20 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="container-responsive">
        <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">
          {{ $t('settings.appSettings') }}
        </h1>
      </div>
    </header>

    <div class="container-responsive py-4 space-y-4">
      <!-- 主题设置 -->
      <section class="ios-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-ios-dark-gray dark:text-dark-text">
              {{ $t('settings.themeMode') }}
            </h3>
            <p class="text-sm text-ios-gray dark:text-dark-secondary">
              {{ $t('settings.switchTheme') }}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <!-- 语言设置 -->
      <section class="ios-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-ios-dark-gray dark:text-dark-text">
              {{ $t('nav.language') }}
            </h3>
            <p class="text-sm text-ios-gray dark:text-dark-secondary">
              选择应用显示语言
            </p>
          </div>
          <select
            :value="settingsStore.language"
            @change="changeLanguage"
            class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text focus:border-ios-blue outline-none"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="ru">Русский</option>
            <option value="ar">العربية</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </section>

      <!-- 音频设置 -->
      <section class="ios-card p-4">
        <h3 class="font-medium text-ios-dark-gray dark:text-dark-text mb-4">
          {{ $t('settings.audioSettings') }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm text-ios-gray dark:text-dark-secondary">
                {{ $t('settings.volume') }}
              </label>
              <span class="text-sm font-medium text-ios-dark-gray dark:text-dark-text">
                {{ Math.round(settingsStore.volume * 100) }}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="settingsStore.volume"
              @input="updateVolume"
              class="w-full h-1.5 bg-gray-200 dark:bg-dark-gray rounded-full appearance-none cursor-pointer accent-ios-blue"
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-ios-gray dark:text-dark-secondary">
              {{ $t('settings.mute') }}
            </span>
            <button
              @click="toggleMute"
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
            >
              <component 
                :is="settingsStore.isMuted ? SpeakerXMarkIcon : SpeakerWaveIcon" 
                class="w-5 h-5 text-ios-gray dark:text-dark-secondary"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-ios-gray dark:text-dark-secondary">
              自动播放下一个
            </span>
            <button
              @click="settingsStore.autoPlayNext = !settingsStore.autoPlayNext"
              class="relative w-10 h-6 rounded-full transition-colors"
              :class="settingsStore.autoPlayNext ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-dark-gray'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform"
                :class="settingsStore.autoPlayNext ? 'translate-x-4' : ''"
              ></span>
            </button>
          </div>
        </div>
      </section>

      <!-- 睡眠定时器 -->
      <section class="ios-card p-4">
        <SleepTimer />
      </section>

      <!-- 关于 -->
      <section class="ios-card p-4">
        <h3 class="font-medium text-ios-dark-gray dark:text-dark-text mb-2">
          {{ $t('settings.aboutApp') }}
        </h3>
        <div class="space-y-2 text-sm text-ios-gray dark:text-dark-secondary">
          <div class="flex justify-between">
            <span>{{ $t('settings.version') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">2.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>{{ $t('settings.deviceType') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ deviceType }}</span>
          </div>
          <div class="flex justify-between">
            <span>数据源</span>
            <span class="text-ios-dark-gray dark:text-dark-text">Radio Browser</span>
          </div>
        </div>
      </section>

      <!-- 重置 -->
      <button
        @click="resetAll"
        class="w-full p-3 text-ios-red border border-ios-red rounded-ios hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        重置所有设置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import { platform } from '@/utils/platform'

import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/vue/24/outline'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SleepTimer from '@/components/SleepTimer.vue'

const settingsStore = useSettingsStore()
const playerStore = usePlayerStore()
const toastStore = useToastStore()

const deviceType = computed(() => {
  const os = platform.getOS()
  const map: Record<string, string> = {
    'windows': 'Windows',
    'mac': 'macOS',
    'linux': 'Linux',
    'android': 'Android',
    'ios': 'iOS'
  }
  return map[os] || settingsStore.$t('settings.unknown')
})

const changeLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement
  settingsStore.setLanguage(target.value as any)
  toastStore.showSuccess('语言已切换')
}

const updateVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  settingsStore.setVolume(value)
  playerStore.setVolume(value)
}

const toggleMute = () => {
  settingsStore.setMuted(!settingsStore.isMuted)
  playerStore.toggleMute()
}

const resetAll = () => {
  if (confirm('确定要重置所有设置吗？')) {
    settingsStore.resetSettings()
    playerStore.setVolume(settingsStore.volume)
    toastStore.showInfo('所有设置已重置')
  }
}

onMounted(() => {
  // 同步音量
  playerStore.setVolume(settingsStore.volume)
})
</script>
