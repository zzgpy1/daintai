<template>
  <div class="sleep-timer">
    <button
      @click="openDialog"
      class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-all active:scale-95"
      :class="{ 'text-ios-blue': hasActiveTimer }"
      :title="$t('settings.sleepTimer')"
    >
      <MoonIcon class="w-5 h-5" />
      <span
        v-if="hasActiveTimer"
        class="absolute -top-1 -right-1 w-4 h-4 bg-ios-blue text-white text-[10px] rounded-full flex items-center justify-center"
      >
        {{ remainingMinutes }}
      </span>
    </button>

    <!-- 弹窗 -->
    <Teleport to="body">
      <div
        v-if="showDialog"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50"
        @click.self="closeDialog"
      >
        <div 
          class="bg-white dark:bg-dark-card rounded-t-ios sm:rounded-ios p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all"
          :class="{ 'animate-slide-up': showDialog }"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">
              {{ $t('settings.sleepTimer') }}
            </h3>
            <button 
              @click="closeDialog" 
              class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray"
            >
              <XMarkIcon class="w-5 h-5 text-ios-gray" />
            </button>
          </div>

          <!-- 当前状态 -->
          <div v-if="hasActiveTimer" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-blue-700 dark:text-blue-300">
                {{ $t('settings.timerActive') }}
              </span>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300 font-mono">
                {{ remainingTime }}
              </span>
            </div>
          </div>

          <!-- 预设时间 -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button
              v-for="option in timerOptions"
              :key="option"
              @click="setTimer(option)"
              class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
            >
              <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ option }}</div>
              <div class="text-xs text-ios-gray dark:text-dark-secondary">{{ $t('settings.minutes') }}</div>
            </button>
          </div>

          <!-- 自定义时间 -->
          <div class="flex gap-2 mb-4">
            <input
              v-model.number="customMinutes"
              type="number"
              min="1"
              max="480"
              :placeholder="$t('settings.enterMinutes')"
              class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 outline-none"
            />
            <button
              @click="setTimer(customMinutes)"
              :disabled="!customMinutes || customMinutes < 1"
              class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ $t('settings.setTimer') }}
            </button>
          </div>

          <!-- 取消 -->
          <button
            v-if="hasActiveTimer"
            @click="cancelTimer"
            class="w-full p-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {{ $t('settings.cancelTimer') }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import { useLanguageStore } from '@/stores/language'
import { MoonIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()
const toastStore = useToastStore()
const languageStore = useLanguageStore()

const showDialog = ref(false)
const customMinutes = ref<number>(30)
const timerOptions = [15, 30, 45, 60, 90, 120]

const hasActiveTimer = computed(() => playerStore.sleepTimer !== null)
const remainingMinutes = computed(() => Math.ceil(playerStore.sleepTimerRemaining || 0))
const remainingTime = computed(() => playerStore.getSleepTimerRemaining())

const openDialog = () => {
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const setTimer = (minutes: number) => {
  if (minutes > 0) {
    playerStore.setSleepTimer(minutes)
    closeDialog()
    toastStore.showSuccess(
      languageStore.t('settings.timerSetSuccess', { time: `${minutes} ${languageStore.t('settings.minutes')}` })
    )
  }
}

const cancelTimer = () => {
  playerStore.clearSleepTimer()
  closeDialog()
  toastStore.showInfo(languageStore.t('settings.timerCancelled'))
}

// ESC键关闭
const handleEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDialog()
  }
}

document.addEventListener('keydown', handleEsc)

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@media (min-width: 640px) {
  .animate-slide-up {
    animation: none;
  }
}
</style>
