<template>
  <div class="sleep-timer">
    <button
      @click="showDialog = true"
      class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
      :class="{ 'text-ios-blue': isActive }"
    >
      <MoonIcon class="w-5 h-5" />
      <span
        v-if="isActive"
        class="absolute -top-1 -right-1 w-4 h-4 bg-ios-blue text-white text-[10px] rounded-full flex items-center justify-center"
      >
        {{ remainingMinutes }}
      </span>
    </button>

    <!-- 定时器弹窗 -->
    <Teleport to="body">
      <div
        v-if="showDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDialog = false"
      >
        <div class="bg-white dark:bg-dark-card rounded-ios p-6 max-w-sm w-full mx-4 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">
              睡眠定时器
            </h3>
            <button @click="showDialog = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
              <XMarkIcon class="w-5 h-5 text-ios-gray" />
            </button>
          </div>

          <div v-if="isActive" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-blue-700 dark:text-blue-300">定时器已启动</span>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ remainingTime }}</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 mb-4">
            <button
              v-for="option in timerOptions"
              :key="option"
              @click="setTimer(option)"
              class="p-3 rounded-lg border border-gray-200 dark:border-dark-gray text-center hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
            >
              <div class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ option }}</div>
              <div class="text-xs text-ios-gray dark:text-dark-secondary">分钟</div>
            </button>
          </div>

          <div class="flex gap-2 mb-4">
            <input
              v-model.number="customMinutes"
              type="number"
              min="1"
              max="480"
              placeholder="自定义分钟"
              class="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-gray rounded-lg bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text"
            />
            <button
              @click="setTimer(customMinutes)"
              :disabled="!customMinutes || customMinutes < 1"
              class="px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              设置
            </button>
          </div>

          <button
            v-if="isActive"
            @click="cancelTimer"
            class="w-full p-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            取消定时器
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MoonIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const timerOptions = [15, 30, 45, 60, 90, 120]
const customMinutes = ref<number>(30)
const showDialog = ref(false)

// 模拟定时器状态（实际应使用 store）
const isActive = ref(false)
const remainingMinutes = ref(0)
const remainingTime = ref('--:--')

const setTimer = (minutes: number) => {
  if (minutes > 0) {
    isActive.value = true
    remainingMinutes.value = minutes
    remainingTime.value = `${String(minutes).padStart(2, '0')}:00`
    showDialog.value = false
  }
}

const cancelTimer = () => {
  isActive.value = false
  remainingMinutes.value = 0
  remainingTime.value = '--:--'
  showDialog.value = false
}
</script>
