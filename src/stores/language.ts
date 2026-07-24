import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { translations } from '@/config/translations'

export type SupportedLanguage = 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<SupportedLanguage>('zh')

  const currentLanguageInfo = computed(() => ({
    code: currentLanguage.value,
    name: getLanguageName(currentLanguage.value),
    nativeName: getNativeLanguageName(currentLanguage.value)
  }))

  const t = (key: string): string => {
    const keys = key.split('.')
    let result: any = translations[currentLanguage.value]
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k]
      } else {
        return key
      }
    }
    return typeof result === 'string' ? result : key
  }

  const setLanguage = (lang: SupportedLanguage) => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }

  const initLanguage = () => {
    const saved = localStorage.getItem('language') as SupportedLanguage
    if (saved && Object.keys(translations).includes(saved)) {
      currentLanguage.value = saved
    }
  }

  return { currentLanguage, currentLanguageInfo, t, setLanguage, initLanguage }
})

function getLanguageName(code: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    zh: '中文', en: 'English', es: 'Español', fr: 'Français',
    de: 'Deutsch', ja: '日本語', ko: '한국어', ru: 'Русский'
  }
  return names[code] || code
}

function getNativeLanguageName(code: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    zh: '中文', en: 'English', es: 'Español', fr: 'Français',
    de: 'Deutsch', ja: '日本語', ko: '한국어', ru: 'Русский'
  }
  return names[code] || code
}
