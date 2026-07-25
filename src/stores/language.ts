import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export type SupportedLanguage = 'zh' | 'en'

export const useLanguageStore = defineStore('language', () => {
  const { locale, t } = useI18n()
  
  const currentLanguage = ref<SupportedLanguage>(
    (localStorage.getItem('language') as SupportedLanguage) || 'zh'
  )
  
  // 支持的语言列表（仅 zh 和 en）
  const supportedLanguages = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' }
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
    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
      currentLanguage.value = savedLang
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'zh' || browserLang === 'en') {
        currentLanguage.value = browserLang as SupportedLanguage
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
