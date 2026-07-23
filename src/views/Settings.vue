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

      <!-- 关于 -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-3">{{ t('settings.aboutApp') }}</h2>
        <div class="space-y-2 text-sm">
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
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

const languageStore = useLanguageStore()
const themeStore = useThemeStore()
const { t, languages, currentLanguage, setLanguage } = languageStore

const deviceType = computed(() => {
  const width = window.innerWidth
  if (width >= 1024) return t('settings.desktop')
  if (width >= 768) return t('settings.tablet')
  return t('settings.mobile')
})
</script>
