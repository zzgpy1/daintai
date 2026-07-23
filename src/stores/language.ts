import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SupportedLanguage = 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt' | 'it' | 'hi' | 'th' | 'vi'

interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
}

export const useLanguageStore = defineStore('language', () => {
  // 支持的语言列表
  const languages: LanguageInfo[] = [
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
  ]

  const currentLanguage = ref<SupportedLanguage>('zh')
  const translations = ref<Record<string, any>>({})
  const isLoaded = ref(false)

  // 获取当前语言信息
  const currentLanguageInfo = computed(() => {
    return languages.find(lang => lang.code === currentLanguage.value) || languages[0]
  })

  // 加载翻译文件
  const loadTranslations = async (lang: SupportedLanguage) => {
    try {
      // 模拟动态导入翻译文件
      const module = await import(`@/config/translations.ts`)
      const allTranslations = module.translations || {}
      translations.value = allTranslations[lang] || allTranslations['en'] || {}
      isLoaded.value = true
    } catch (error) {
      console.error('加载翻译失败:', error)
      // 加载英文作为备用
      const module = await import(`@/config/translations.ts`)
      const allTranslations = module.translations || {}
      translations.value = allTranslations['en'] || {}
      isLoaded.value = true
    }
  }

  // 翻译函数
  const t = (key: string, params?: Record<string, any>): string => {
    if (!isLoaded.value) {
      return key
    }

    const keys = key.split('.')
    let result: any = translations.value

    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = result[k]
      } else {
        return key
      }
    }

    if (typeof result !== 'string') {
      return key
    }

    // 替换参数
    if (params) {
      return result.replace(/\{(\w+)\}/g, (_, name) => {
        return params[name] !== undefined ? String(params[name]) : `{${name}}`
      })
    }

    return result
  }

  // 切换语言
  const setLanguage = async (lang: SupportedLanguage) => {
    if (currentLanguage.value === lang && isLoaded.value) {
      return
    }
    currentLanguage.value = lang
    await loadTranslations(lang)
    localStorage.setItem('radio-language', lang)
  }

  // 初始化语言
  const initLanguage = async () => {
    const savedLang = localStorage.getItem('radio-language') as SupportedLanguage | null
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage
    
    // 检查保存的语言是否有效
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
    await loadTranslations(targetLang)
  }

  return {
    languages,
    currentLanguage,
    currentLanguageInfo,
    translations,
    isLoaded,
    t,
    setLanguage,
    initLanguage
  }
})
