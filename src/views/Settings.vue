<template>
  <div class="settings-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <header class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <h1 class="text-lg sm:text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('nav.settings') }}</h1>
    </header>

    <div class="container-responsive py-4 space-y-4">
      <!-- 主题设置 -->
      <section class="ios-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">{{ t('settings.themeMode') }}</h2>
            <p class="text-sm text-ios-gray dark:text-dark-secondary">{{ t('settings.switchTheme') }}</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <!-- 音频设置 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold mb-4">{{ t('settings.audioSettings') }}</h2>
        <div>
          <label class="block text-sm font-medium text-ios-gray dark:text-dark-secondary mb-2">
            {{ t('settings.volume') }}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
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
      </section>

      <!-- 关于 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold mb-4">{{ t('settings.aboutApp') }}</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">{{ t('settings.version') }}</span>
            <span class="text-ios-dark-gray dark:text-dark-text">1.0.0</span>
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
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import ThemeToggle from '@/components/ThemeToggle.vue'

const playerStore = usePlayerStore()
const { t } = useLanguageStore()

const setVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  playerStore.setVolume(parseFloat(target.value))
}

const deviceType = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth
    if (width >= 1024) return t('settings.desktop')
    if (width >= 768) return t('settings.tablet')
    return t('settings.mobile')
  }
  return t('settings.unknown')
})
</script>
