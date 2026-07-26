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
        <div class="bg-white dark:bg-dark-card rounded-ios p-4 shadow-lg border border-gray-200 dark:border-dark-gray">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <ArrowPathIcon class="w-5 h-5 text-ios-blue" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-ios-dark-gray dark:text-dark-text">发现新版本</h4>
              <p class="text-sm text-ios-gray dark:text-dark-secondary">点击"立即更新"开始下载</p>
            </div>
            <button @click="showUpdate = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
              <XMarkIcon class="w-4 h-4 text-ios-gray" />
            </button>
          </div>
          <button
            @click="updateNow"
            class="w-full mt-3 px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            立即更新
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowPathIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { platform } from '@/utils/platform'

const showUpdate = ref(false)

const checkForUpdates = () => {
  if (platform.isDesktop() && window.electronAPI) {
    window.electronAPI.onUpdateAvailable(() => {
      showUpdate.value = true
    })
    window.electronAPI.onUpdateDownloaded(() => {
      showUpdate.value = true
    })
  }
}

const updateNow = () => {
  if (platform.isDesktop() && window.electronAPI) {
    window.electronAPI.installUpdate()
  }
}

onMounted(() => {
  checkForUpdates()
})
</script>
