<template>
  <!-- ... 其他内容不变 ... -->
  <div class="ios-card p-4">
    <h3 class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('settings.about') }}</h3>
    <div class="mt-2 space-y-1 text-sm text-ios-gray dark:text-dark-secondary">
      <p>{{ $t('settings.version') }}: {{ appVersion }}</p>
      <p>设备类型: {{ deviceType }}</p>
      <p>
        <span>GitHub: </span>
        <a 
          href="https://github.com/zzgpy1/diantai" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-ios-blue hover:underline"
        >
          zzgpy1/diantai
        </a>
      </p>
      <p>数据来源: Radio Browser</p>
      <p>© {{ currentYear }} 国内电台</p>
      
      <!-- 更新状态 -->
      <div class="mt-3 flex items-center gap-3 flex-wrap">
        <button 
          @click="manualCheckUpdate"
          :disabled="checkingUpdate"
          class="px-4 py-1.5 bg-ios-blue text-white rounded-ios text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {{ checkingUpdate ? '检查中...' : '检查更新' }}
        </button>
        <span v-if="updateStatus" :class="updateStatusClass" class="text-sm">
          {{ updateStatus }}
        </span>
        <button 
          v-if="hasNewVersion"
          @click="downloadUpdate"
          class="px-4 py-1.5 bg-ios-green text-white rounded-ios text-sm hover:bg-green-600 transition-colors"
        >
          去更新 (v{{ latestVersion }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { usePlayerStore } from '@/stores/player'
import BackButton from '@/components/common/BackButton.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import SleepTimer from '@/components/common/SleepTimer.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'
import { getCurrentVersion, checkForUpdate, type ReleaseInfo } from '@/services/versionCheck'
import { platform } from '@/utils/platform'

const { locale } = useI18n()
const settingsStore = useSettingsStore()
const playerStore = usePlayerStore()

const language = ref(settingsStore.language)
const volume = ref(settingsStore.volume)
const autoPlayNext = ref(settingsStore.autoPlayNext)
const appVersion = getCurrentVersion()
const currentYear = new Date().getFullYear()

const deviceType = computed(() => {
  const plat = platform.getPlatform()
  if (plat === 'electron') return '电脑端 (Electron)'
  if (plat === 'capacitor') return '移动端 (Android)'
  return '网页端'
})

const checkingUpdate = ref(false)
const updateStatus = ref('')
const updateStatusClass = ref('')
const hasNewVersion = ref(false)
const latestVersion = ref('')
let latestReleaseInfo: ReleaseInfo | null = null

const currentLanguageName = computed(() => {
  return language.value === 'zh' ? '中文' : 'English'
})

const changeLanguage = () => {
  settingsStore.setLanguage(language.value)
  locale.value = language.value
}

const onVolumeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  playerStore.setVolume(volume.value)
  settingsStore.setVolume(volume.value)
}

const saveSettings = () => {
  settingsStore.autoPlayNext = autoPlayNext.value
  localStorage.setItem('autoPlayNext', String(autoPlayNext.value))
}

// 核心更新检测逻辑
const performCheck = async (showResult = true) => {
  if (checkingUpdate.value) return
  checkingUpdate.value = true
  updateStatus.value = ''
  updateStatusClass.value = ''
  hasNewVersion.value = false
  latestVersion.value = ''

  try {
    console.log('[UI] 开始检查更新...')
    const result = await checkForUpdate()
    console.log('[UI] 检查结果:', result)
    
    if (result.error) {
      updateStatus.value = result.error
      updateStatusClass.value = 'text-ios-red'
      return
    }
    
    if (result.hasUpdate && result.latest) {
      hasNewVersion.value = true
      latestVersion.value = result.latest.version
      latestReleaseInfo = result.latest
      updateStatus.value = `发现新版本 v${result.latest.version}`
      updateStatusClass.value = 'text-ios-red'
    } else {
      updateStatus.value = '已是最新版本'
      updateStatusClass.value = 'text-ios-green'
      if (result.latest) {
        latestVersion.value = result.latest.version
      }
    }
  } catch (error) {
    console.error('[UI] 检查更新异常:', error)
    updateStatus.value = '检查更新失败，请重试'
    updateStatusClass.value = 'text-ios-red'
  } finally {
    checkingUpdate.value = false
  }
}

// 手动点击检查更新
const manualCheckUpdate = async () => {
  console.log('[UI] 用户点击检查更新按钮')
  await performCheck(true)
}

// 点击"去更新"
const downloadUpdate = () => {
  if (latestReleaseInfo?.downloadUrl) {
    window.open(latestReleaseInfo.downloadUrl, '_blank')
  } else {
    window.open('https://github.com/zzgpy1/diantai/releases/latest', '_blank')
  }
}

// 页面加载时自动检查
onMounted(async () => {
  console.log('[UI] 页面加载，执行静默检查')
  await performCheck(false)
})
</script>
