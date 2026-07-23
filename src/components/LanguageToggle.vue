<template>
  <div class="relative">
    <button @click="isOpen = !isOpen" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors">
      <LanguageIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
    </button>
    <div v-if="isOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-ios shadow-ios-lg border border-gray-200 dark:border-dark-gray overflow-hidden z-50">
      <button v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang.code)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
        :class="currentLanguage === lang.code ? 'text-ios-blue font-medium' : 'text-ios-dark-gray dark:text-dark-text'">
        {{ lang.nativeName }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { LanguageIcon } from '@heroicons/vue/24/outline'

const languageStore = useLanguageStore()
const { languages, currentLanguage, setLanguage } = languageStore

const isOpen = ref(false)

const selectLanguage = async (code: string) => {
  await setLanguage(code as any)
  isOpen.value = false
}
</script>
