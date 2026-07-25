import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SupportedLanguage } from '@/types/store'

export const useLanguageStore = defineStore('language', () => {
  const { locale, t, messages } = useI18n()
  
  const currentLanguage = ref<SupportedLanguage>((localStorage.getItem('language') as SupportedLanguage) || 'zh')
  
  // 支持的语言列表
  const supportedLanguages = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Español', nativeName: 'Español' },
    { code: 'fr', name: 'Français', nativeName: 'Français' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
    { code: 'ja', name: '日本語', nativeName: '日本語' },
    { code: 'ko', name: '한국어', nativeName: '한국어' },
    { code: 'ru', name: 'Русский', nativeName: 'Русский' },
    { code: 'ar', name: 'العربية', nativeName: 'العربية' },
    { code: 'pt', name: 'Português', nativeName: 'Português' }
  ]

  const currentLanguageInfo = computed(() => {
    return supportedLanguages.find(lang => lang.code === currentLanguage.value) || supportedLanguages[0]
  })

  // 切换语言
  const setLanguage = (lang: SupportedLanguage) => {
    currentLanguage.value = lang
    locale.value = lang
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }

  // 初始化语言
  const initLanguage = async () => {
    const savedLang = localStorage.getItem('language') as SupportedLanguage
    if (savedLang && supportedLanguages.some(lang => lang.code === savedLang)) {
      currentLanguage.value = savedLang
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage
      if (supportedLanguages.some(lang => lang.code === browserLang)) {
        currentLanguage.value = browserLang
      }
    }
    locale.value = currentLanguage.value
    document.documentElement.lang = currentLanguage.value
  }

  // 翻译函数
  const translate = (key: string, params?: Record<string, any>): string => {
    try {
      return t(key, params)
    } catch {
      return key
    }
  }

  return {
    // 状态
    currentLanguage,
    supportedLanguages,
    
    // 计算属性
    currentLanguageInfo,
    
    // 方法
    setLanguage,
    initLanguage,
    t: translate
  }
})
