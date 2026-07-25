<!-- src/components/common/VersionChecker.vue -->
<template>
  <div v-if="showUpdateDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white dark:bg-dark-card rounded-xl max-w-md w-full mx-4 p-6 shadow-2xl">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowDownTrayIcon class="w-8 h-8 text-ios-blue" />
        </div>
        <h3 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">
          发现新版本
        </h3>
        <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">
          版本 {{ updateInfo?.version }}
        </p>
      </div>

      <div class="mb-6">
        <p class="text-sm font-medium text-ios-dark-gray dark:text-dark-text mb-2">
          更新内容：
        </p>
        <ul class="space-y-1">
          <li
            v-for="(item, index) in updateInfo?.changelog || []"
            :key="index"
            class="text-sm text-ios-gray dark:text-dark-secondary flex items-start gap-2"
          >
            <span class="text-ios-blue">•</span>
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          v-if="updateInfo?.mandatory !== false"
          @click="downloadAndInstall"
          class="flex-1 px-6 py-3 bg-ios-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          <span v-if="downloadProgress === null">立即更新</span>
          <span v-else>下载中 {{ downloadProgress }}%</span>
        </button>
        <button
          v-else
          @click="downloadLater"
          class="flex-1 px-6 py-3 bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-dark-light-gray transition-colors"
        >
          稍后提醒
        </button>
        <button
          v-if="!updateInfo?.mandatory"
          @click="dismissUpdate"
          class="px-6 py-3 text-ios-gray dark:text-dark-secondary hover:text-ios-dark-gray dark:hover:text-dark-text transition-colors"
        >
          忽略此版本
        </button>
      </div>

      <!-- 下载进度 -->
      <div v-if="downloadProgress !== null && downloadProgress < 100" class="mt-4">
        <div class="w-full h-2 bg-gray-200 dark:bg-dark-gray rounded-full overflow-hidden">
          <div
            class="h-full bg-ios-blue transition-all duration-300"
            :style="{ width: `${downloadProgress}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { updateService } from '@/services/updateService'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

const settingsStore = useSettingsStore()
const downloadProgress = ref<number | null>(null)
const isInstalling = ref(false)

const showUpdateDialog = computed(() => settingsStore.pendingUpdate !== null)
const updateInfo = computed(() => settingsStore.pendingUpdate)

const downloadAndInstall = async () => {
  if (!updateInfo.value) return
  
  try {
    downloadProgress.value = 0
    
    // 模拟下载进度
    const interval = setInterval(() => {
      if (downloadProgress.value !== null && downloadProgress.value < 90) {
        downloadProgress.value += Math.random() * 10
      }
    }, 1000)
    
    const success = await updateService.downloadUpdate(updateInfo.value)
    clearInterval(interval)
    
    if (success) {
      downloadProgress.value = 100
      
      // Electron自动安装
      if (window.electron) {
        setTimeout(() => {
          window.electron.installUpdate()
        }, 2000)
      }
    }
  } catch (error) {
    console.error('下载更新失败:', error)
    downloadProgress.value = null
  }
}

const downloadLater = () => {
  settingsStore.dismissUpdate()
}

const dismissUpdate = () => {
  settingsStore.dismissUpdate()
  settingsStore.setIgnoredVersion(updateInfo.value?.version || '')
}

// 监听更新事件
onMounted(() => {
  if (window.electron) {
    window.electron.onUpdateProgress((progress: any) => {
      const percent = Math.round((progress.bytesPerSecond * progress.percent) / 100)
      downloadProgress.value = Math.min(percent, 99)
    })
    
    window.electron.onUpdateDownloaded(() => {
      downloadProgress.value = 100
    })
  }
})
</script>
