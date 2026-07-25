import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SupportedLanguage } from '@/types/store'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

export const useLanguageStore = defineStore('language', () => {
  const { locale, t } = useI18n()
  
  const currentLanguage = ref<SupportedLanguage>(
    (localStorage.getItem('language') as SupportedLanguage) || 'zh'
  )
  
  // 使用常量
  const supportedLanguages = SUPPORTED_LANGUAGES

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
