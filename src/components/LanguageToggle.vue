<template>
  <button
    @click="toggleLanguage"
    class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
    :title="`当前语言: ${currentLanguageName}`"
  >
    <LanguageIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { LanguageIcon } from '@heroicons/vue/24/outline'

const languageStore = useLanguageStore()

const currentLanguageName = computed(() => {
  return languageStore.currentLanguageInfo.nativeName
})

const toggleLanguage = () => {
  const languages = ['zh', 'en', 'es', 'fr', 'de', 'ja', 'ko', 'ru']
  const currentIndex = languages.indexOf(languageStore.currentLanguage)
  const nextIndex = (currentIndex + 1) % languages.length
  languageStore.setLanguage(languages[nextIndex] as any)
}
</script>
