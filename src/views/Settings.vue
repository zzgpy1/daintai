<template>
  <div class="settings-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4 space-y-6">
      <!-- 标题 -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">⚙️ 设置</h1>
        <button @click="$router.push('/')" class="text-ios-blue text-sm">返回首页</button>
      </div>

      <!-- ============================================ -->
      <!-- 1. 主题设置 -->
      <!-- ============================================ -->
      <section class="ios-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">🌓 主题模式</h2>
            <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">切换应用的外观主题</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 2. 睡眠定时器 -->
      <!-- ============================================ -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">⏱️ 睡眠定时器</h2>
        
        <div v-if="playerStore.hasSleepTimer" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">定时器已启动</p>
              <p class="text-xs text-blue-600 dark:text-blue-400">剩余 {{ playerStore.sleepTimerRemaining }} 分钟后停止</p>
            </div>
            <button
              @click="clearSleepTimer"
              class="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-4 gap-3">
          <button
            v-for="time in [15, 30, 45, 60]"
            :key="time"
            @click="setSleepTimer(time)"
            class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-gray-50 dark:hover:bg-dark-gray transition-all"
          >
            <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ time }}</div>
            <div class="text-xs text-ios-gray dark:text-dark-secondary">分钟</div>
          </button>
        </div>

        <div v-if="!playerStore.hasSleepTimer" class="mt-4">
          <div class="flex gap-2">
            <input
              v-model.number="customMinutes"
              type="number"
              min="1"
              max="480"
              placeholder="自定义分钟"
              class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text"
            />
            <button
              @click="setSleepTimer(customMinutes)"
              :disabled="!customMinutes || customMinutes < 1"
              class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              设置
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 3. 关于应用 -->
      <!-- ============================================ -->
      <section class="ios-card p-4">
        <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">📱 关于应用</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">应用名称</span>
            <span class="text-ios-dark-gray dark:text-dark-text font-medium">全球电台</span>
          </div>

          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">当前版本</span>
            <span class="text-ios-dark-gray dark:text-dark-text font-medium text-ios-blue">{{ currentVersion }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">设备类型</span>
            <span class="text-ios-dark-gray dark:text-dark-text">{{ deviceType }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-ios-gray dark:text-dark-secondary">最新版本</span>
            <span 
              class="font-medium"
              :class="[
                hasNewVersion ? 'text-ios-green' : 'text-ios-gray dark:text-dark-secondary'
              ]"
            >
              {{ latestVersion || (isChecking ? '检查中...' : '已是最新') }}
            </span>
          </div>

          <div class="flex flex-col gap-2 mt-3">
            <button
              @click="manualCheckUpdate"
              :disabled="isChecking"
              class="w-full p-3 bg-ios-blue text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isChecking">⏳ 检查中...</span>
              <span v-else-if="hasNewVersion">🎉 发现新版本 {{ latestVersion }}，点击更新</span>
              <span v-else>🔍 检查更新</span>
            </button>

            <button
              v-if="hasNewVersion && downloadUrl"
              @click="downloadUpdate"
              class="w-full p-3 border border-ios-blue text-ios-blue rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              ⬇️ 下载最新版本
            </button>

            <button
              v-if="hasNewVersion"
              @click="skipVersion"
              class="w-full p-2 text-xs text-ios-gray dark:text-dark-secondary hover:text-ios-blue transition-colors"
            >
              忽略此版本
            </button>
          </div>

          <div class="border-t border-gray-100 dark:border-dark-gray pt-3 mt-2">
            <div class="flex justify-between">
              <span class="text-ios-gray dark:text-dark-secondary">GitHub</span>
              <a
                href="https://github.com/zzgpy1/daintai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-ios-blue hover:underline truncate"
              >
                zzgpy1/daintai
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 更新弹窗 -->
    <UpdateDialog
      v-if="showUpdateDialog"
      :update-info="updateInfo"
      @close="showUpdateDialog = false"
      @download="handleDialogDownload"
      @skip="handleDialogSkip"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import { UpdateChecker, type UpdateInfo } from '@/services/updateChecker'
import ThemeToggle from '@/components/ThemeToggle.vue'
import UpdateDialog from '@/components/UpdateDialog.vue'

const playerStore = usePlayerStore()
const toastStore = useToastStore()

const currentVersion = ref('v2026.07.24-114207')
const latestVersion = ref('')
const downloadUrl = ref('')
const hasNewVersion = ref(false)
const isChecking = ref(false)
const customMinutes = ref<number>(30)

const showUpdateDialog = ref(false)
const updateInfo = ref<UpdateInfo>({
  hasUpdate: false,
  version: '',
  downloadUrl: '',
  releaseDate: '',
  body: ''
})

const deviceType = computed(() => {
  const width = window.innerWidth
  if (width >= 1024) return '💻 桌面端'
  if (width >= 768) return '📱 平板端'
  return '📱 手机端'
})

const manualCheckUpdate = async () => {
  isChecking.value = true
  try {
    const checker = UpdateChecker.getInstance()
    const result = await checker.checkForUpdate(true) // 强制检查
    
    if (result.hasUpdate) {
      latestVersion.value = result.version
      downloadUrl.value = result.downloadUrl
      hasNewVersion.value = true
      toastStore.showSuccess(`发现新版本 ${result.version}`)
    } else {
      latestVersion.value = currentVersion.value
      hasNewVersion.value = false
      toastStore.showInfo('当前已是最新版本')
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    toastStore.showError('检查更新失败，请稍后重试')
  } finally {
    isChecking.value = false
  }
}

const downloadUpdate = () => {
  if (downloadUrl.value) {
    window.open(downloadUrl.value, '_blank')
    toastStore.showSuccess('正在下载更新...')
  }
}

const skipVersion = () => {
  if (latestVersion.value) {
    localStorage.setItem('skipped_version', latestVersion.value)
    hasNewVersion.value = false
    toastStore.showInfo(`已忽略版本 ${latestVersion.value}`)
  }
}

const handleDialogDownload = () => {
  showUpdateDialog.value = false
  toastStore.showSuccess('正在下载更新...')
}

const handleDialogSkip = () => {
  showUpdateDialog.value = false
}

const setSleepTimer = (minutes: number) => {
  if (minutes > 0) {
    playerStore.setSleepTimer(minutes)
    const timeText = minutes >= 60 ? `${Math.floor(minutes / 60)}小时${minutes % 60}分钟` : `${minutes}分钟`
    toastStore.showSuccess(`⏱️ 定时器已设置：${timeText}后停止播放`)
  }
}

const clearSleepTimer = () => {
  playerStore.clearSleepTimer()
  toastStore.showInfo('⏱️ 定时器已取消')
}

onMounted(() => {
  // 延迟检查，避免干扰首次加载
  setTimeout(() => {
    manualCheckUpdate()
  }, 3000)
})
</script>
