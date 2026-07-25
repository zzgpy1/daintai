<template>
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
      :title="$t('nav.language')"
    >
      <LanguageIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
    </button>
    
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-dark-card rounded-ios shadow-ios-lg border border-gray-200 dark:border-dark-gray z-50"
      @click.away="showDropdown = false"
    >
      <button
        v-for="lang in languageStore.supportedLanguages"
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors flex items-center justify-between"
        :class="[
          languageStore.currentLanguage === lang.code
            ? 'text-ios-blue'
            : 'text-ios-dark-gray dark:text-dark-text'
        ]"
      >
        <span>{{ lang.nativeName }}</span>
        <CheckIcon v-if="languageStore.currentLanguage === lang.code" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { LanguageIcon, CheckIcon } from '@heroicons/vue/24/outline'

const languageStore = useLanguageStore()
const showDropdown = ref(false)

const selectLanguage = (code: string) => {
  languageStore.setLanguage(code as any)
  showDropdown.value = false
}
</script>
