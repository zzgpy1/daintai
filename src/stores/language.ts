import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { translations, type SupportedLanguage } from '@/config/translations'

export const useLanguageStore = defineStore('language', () => {
  const languages = [
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' }
  ]

  const currentLanguage = ref<SupportedLanguage>('zh')
  const isLoaded = ref(false)

  const currentLanguageInfo = computed(() => {
    return languages.find(lang => lang.code === currentLanguage.value) || languages[0]
  })

  const t = (key: string, params?: Record<string, any>): string => {
    if (!isLoaded.value) return key

    const keys = key.split('.')
    let result: any = translations[currentLanguage.value]

    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = result[k]
      } else {
        return key
      }
    }

    if (typeof result !== 'string') return key

    if (params) {
      return result.replace(/\{(\w+)\}/g, (_, name) => {
        return params[name] !== undefined ? String(params[name]) : `{${name}}`
      })
    }

    return result
  }

  const setLanguage = async (lang: SupportedLanguage) => {
    if (currentLanguage.value === lang && isLoaded.value) return
    currentLanguage.value = lang
    isLoaded.value = true
    localStorage.setItem('radio-language', lang)
  }

  const initLanguage = async () => {
    const savedLang = localStorage.getItem('radio-language') as SupportedLanguage | null
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage

    const isValidLang = (lang: string): lang is SupportedLanguage => {
      return languages.some(l => l.code === lang)
    }

    let targetLang: SupportedLanguage = 'zh'

    if (savedLang && isValidLang(savedLang)) {
      targetLang = savedLang
    } else if (isValidLang(browserLang)) {
      targetLang = browserLang
    }

    currentLanguage.value = targetLang
    isLoaded.value = true
  }

  return {
    languages,
    currentLanguage,
    currentLanguageInfo,
    isLoaded,
    t,
    setLanguage,
    initLanguage
  }
})
