<template>
  <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-dark-card rounded-xl max-w-sm w-full p-6 shadow-xl">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowDownTrayIcon class="w-8 h-8 text-green-500" />
        </div>
        <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">发现新版本</h3>
        <p class="text-sm text-ios-gray dark:text-dark-secondary mt-2">版本 {{ updateInfo.version }} 可用</p>
        <p class="text-xs text-ios-gray dark:text-dark-secondary mt-1">{{ formatDate(updateInfo.releaseDate) }}</p>
      </div>

      <div class="flex flex-col gap-3">
        <button
          @click="downloadUpdate"
          class="w-full flex items-center justify-center gap-2 p-4 bg-ios-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ArrowDownTrayIcon class="w-5 h-5" />
          <span>立即更新</span>
        </button>
        <button
          @click="closeDialog"
          class="w-full p-3 border border-gray-200 dark:border-dark-gray rounded-lg text-ios-gray dark:text-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
        >
          稍后提醒
        </button>
        <button
          @click="skipVersion"
          class="w-full p-2 text-xs text-ios-gray dark:text-dark-secondary hover:text-ios-blue transition-colors"
        >
          忽略此版本
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useToastStore } from '@/stores/toast'
import type { UpdateInfo } from '@/services/updateChecker'

const props = defineProps<{
  updateInfo: UpdateInfo
}>()

const emit = defineEmits<{
  close: []
  download: []
  skip: []
}>()

const toastStore = useToastStore()
const showDialog = ref(true)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

const closeDialog = () => {
  showDialog.value = false
  emit('close')
}

const downloadUpdate = () => {
  if (props.updateInfo.downloadUrl) {
    window.open(props.updateInfo.downloadUrl, '_blank')
    toastStore.showSuccess('正在下载更新...')
    showDialog.value = false
    emit('download')
  }
}

const skipVersion = () => {
  if (props.updateInfo.version) {
    localStorage.setItem('skipped_version', props.updateInfo.version)
    showDialog.value = false
    emit('skip')
  }
}

watch(() => props.updateInfo, () => {
  showDialog.value = true
}, { deep: true })
</script>
