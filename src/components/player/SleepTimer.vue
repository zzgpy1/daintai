<!-- src/components/player/SleepTimer.vue -->
<template>
  <div class="sleep-timer">
    <button
      @click="toggleTimer"
      class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
      :class="{
        'text-ios-blue': isActive,
        'text-ios-gray dark:text-dark-secondary': !isActive
      }"
      :title="isActive ? `剩余 ${remainingMinutes} 分钟` : '睡眠定时器'"
    >
      <ClockIcon class="w-5 h-5" />
      <span
        v-if="isActive"
        class="absolute -top-1 -right-1 w-4 h-4 text-xs bg-ios-blue text-white rounded-full flex items-center justify-center"
      >
        {{ remainingMinutes }}
      </span>
    </button>

    <!-- 弹窗 -->
    <div
      v-if="showPopup"
      class="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-dark-card rounded-ios shadow-ios-lg border border-gray-200 dark:border-dark-gray p-4 z-50"
    >
      <h4 class="font-semibold text-ios-dark-gray dark:text-dark-text mb-3">
        睡眠定时器
      </h4>

      <!-- 快捷选项 -->
      <div class="grid grid-cols-3 gap-2 mb-3">
        <button
          v-for="time in presetTimes"
          :key="time"
          @click="setTimer(time)"
          class="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-dark-gray hover:bg-gray-200 dark:hover:bg-dark-light-gray transition-colors"
        >
          {{ time }}分钟
        </button>
      </div>

      <!-- 自定义时间 -->
      <div class="flex gap-2">
        <input
          v-model.number="customMinutes"
          type="number"
          min="1"
          max="480"
          placeholder="自定义"
          class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-ios-blue"
        />
        <button
          @click="setCustomTimer"
          :disabled="!customMinutes || customMinutes < 1"
          class="px-4 py-2 text-sm bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          设置
        </button>
      </div>

      <!-- 当前状态 -->
      <div v-if="isActive" class="mt-3 pt-3 border-t border-gray-200 dark:border-dark-gray">
        <p class="text-sm text-ios-gray dark:text-dark-secondary">
          剩余 <span class="font-semibold text-ios-blue">{{ remainingMinutes }}</span> 分钟
        </p>
        <button
          @click="cancelTimer"
          class="mt-2 w-full px-3 py-2 text-sm text-ios-red bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          取消定时器
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { ClockIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()
const showPopup = ref(false)
const customMinutes = ref<number | null>(30)
const presetTimes = [15, 30, 45, 60, 90, 120]

const isActive = computed(() => playerStore.sleepTimerActive)
const remainingMinutes = computed(() => playerStore.sleepTimerRemaining || 0)

const toggleTimer = () => {
  showPopup.value = !showPopup.value
}

const setTimer = (minutes: number) => {
  playerStore.setSleepTimer(minutes)
  showPopup.value = false
}

const setCustomTimer = () => {
  if (customMinutes.value && customMinutes.value > 0) {
    playerStore.setSleepTimer(customMinutes.value)
    showPopup.value = false
  }
}

const cancelTimer = () => {
  playerStore.clearSleepTimer()
  showPopup.value = false
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.sleep-timer')) {
    showPopup.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
