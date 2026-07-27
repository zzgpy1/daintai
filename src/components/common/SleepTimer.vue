<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('settings.sleepTimer') }}</h3>
        <p v-if="hasActiveTimer" class="text-sm text-blue-600 dark:text-blue-400">
          剩余 {{ remainingText }}
        </p>
        <p v-else class="text-sm text-ios-gray dark:text-dark-secondary">未设置</p>
      </div>
      <button @click="showDialog = true" class="px-4 py-2 bg-ios-blue text-white rounded-ios hover:bg-blue-600">
        {{ hasActiveTimer ? '修改' : '设置' }}
      </button>
    </div>

    <!-- 弹窗 -->
    <Teleport to="body">
      <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showDialog = false">
        <div class="bg-white dark:bg-dark-card rounded-ios p-6 max-w-sm w-full mx-4 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('settings.sleepTimer') }}</h3>
            <button @click="showDialog = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
              <XMarkIcon class="w-5 h-5 text-ios-gray" />
            </button>
          </div>

          <div v-if="hasActiveTimer" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-blue-700 dark:text-blue-300">{{ $t('settings.timerActive') }}</span>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ remainingText }}</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 mb-4">
            <button v-for="opt in timerOptions" :key="opt" @click="setTimer(opt)"
              class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-gray-50 dark:hover:bg-dark-gray">
              <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ opt }}</div>
              <div class="text-xs text-ios-gray dark:text-dark-secondary">{{ $t('settings.minutes') }}</div>
            </button>
          </div>

          <div class="flex gap-2">
            <input v-model.number="customMinutes" type="number" min="1" max="480" placeholder="自定义"
              class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text" />
            <button @click="setTimer(customMinutes)" :disabled="!customMinutes || customMinutes < 1"
              class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {{ $t('settings.setTimer') }}
            </button>
          </div>

          <button v-if="hasActiveTimer" @click="cancelTimer" class="w-full mt-4 p-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            {{ $t('settings.cancelTimer') }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()
const showDialog = ref(false)
const customMinutes = ref(30)

const timerOptions = [15, 30, 45, 60, 90, 120]
const hasActiveTimer = computed(() => playerStore.sleepTimer !== null)
const remainingText = computed(() => {
  const mins = Math.floor(playerStore.sleepTimerRemaining || 0)
  const secs = Math.round((playerStore.sleepTimerRemaining || 0) % 1 * 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const setTimer = (minutes: number) => {
  if (minutes > 0) {
    playerStore.setSleepTimer(minutes)
    showDialog.value = false
  }
}

const cancelTimer = () => {
  playerStore.clearSleepTimer()
  showDialog.value = false
}
</script>
