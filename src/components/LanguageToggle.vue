<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
      title="切换语言"
    >
      <LanguageIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
    </button>

    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-ios shadow-ios-lg border border-gray-200 dark:border-dark-gray overflow-hidden z-50"
      >
        <div class="py-1">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors flex items-center gap-2"
            :class="{
              'text-ios-blue bg-blue-50 dark:bg-blue-900/20': currentLanguage === lang.code,
              'text-ios-dark-gray dark:text-dark-text': currentLanguage !== lang.code
            }"
          >
            <span class="text-base">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
            <span v-if="currentLanguage === lang.code" class="ml-auto">
              <CheckIcon class="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { LanguageIcon, CheckIcon } from '@heroicons/vue/24/outline'

const settingsStore = useSettingsStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
]

const currentLanguage = computed(() => settingsStore.language)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (code: string) => {
  settingsStore.setLanguage(code as any)
  isOpen.value = false
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
