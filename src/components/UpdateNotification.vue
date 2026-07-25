<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showUpdate"
        class="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:max-w-sm"
      >
        <div class="bg-white dark:bg-dark-card rounded-ios p-4 shadow-ios-lg border border-gray-200 dark:border-dark-gray">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <ArrowPathIcon class="w-5 h-5 text-ios-blue" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-ios-dark-gray dark:text-dark-text">
                发现新版本
              </h4>
              <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">
                点击"立即更新"开始下载最新版本
              </p>
            </div>
            <button
              @click="showUpdate = false"
              class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
            >
              <XMarkIcon class="w-4 h-4 text-ios-gray" />
            </button>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              @click="updateNow"
              class="flex-1 px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              立即更新
            </button>
            <button
              @click="showUpdate = false"
              class="px-4 py-2 bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text rounded-lg hover:bg-gray-200 dark:hover:bg-dark-light-gray transition-colors text-sm font-medium"
            >
              稍后提醒
            </button>
          </div>
          <div v-if="downloadProgress > 0" class="mt-3">
            <div class="h-1.5 bg-gray-200 dark:bg-dark-gray rounded-full overflow-hidden">
              <div
                class="h-full bg-ios-blue rounded-full transition-all duration-300"
                :style="{ width: `${downloadProgress}%` }"
              ></div>
            </div>
            <p class="text-xs text-ios-gray dark:text-dark-secondary mt-1 text-center">
              下载中... {{ downloadProgress }}%
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'react'
import { ArrowPathIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { platform } from '@/utils/platform'

const showUpdate = ref(false)
const downloadProgress = ref(0)

// 监听更新事件
let cleanupFns: (() => void)[] = []

const checkForUpdates = () => {
  // Electron平台使用自动更新
  if (platform.isDesktop() && window.electronAPI) {
    const unsubAvailable = window.electronAPI.onUpdateAvailable(() => {
      showUpdate.value = true
    })
    const unsubDownloaded = window.electronAPI.onUpdateDownloaded(() => {
      showUpdate.value = true
      downloadProgress.value = 100
    })
    const unsubError = window.electronAPI.onUpdateError((error) => {
      console.error('更新错误:', error)
    })
    cleanupFns.push(unsubAvailable, unsubDownloaded, unsubError)
  }
}

const updateNow = () => {
  if (platform.isDesktop() && window.electronAPI) {
    window.electronAPI.installUpdate()
  } else if (platform.isMobile()) {
    // Capacitor更新
    // 使用 @capacitor/updater 插件
    import('@capacitor/updater').then(({ Updater }) => {
      Updater.downloadUpdate()
        .then(() => {
          showUpdate.value = false
          Updater.reloadApp()
        })
        .catch(console.error)
    })
  }
}

onMounted(() => {
  checkForUpdates()
})

onUnmounted(() => {
  cleanupFns.forEach(fn => fn())
})
</script>
