<template>
  <div 
    v-if="currentStation"
    class="player-bar fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-gray-200 dark:border-dark-gray"
    :class="{ 'md:bottom-0': !isMobile }"
  >
    <div class="container-responsive px-4 py-3">
      <div class="flex items-center gap-3">
        <!-- 电台信息 -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex-shrink-0 relative">
            <img
              v-if="currentStation.favicon && !faviconError"
              :src="currentStation.favicon"
              :alt="currentStation.name"
              class="w-12 h-12 rounded-ios object-cover cursor-pointer"
              @error="faviconError = true"
              @click="goToDetail"
            />
            <img
              v-else
              :src="generatedIconUrl"
              :alt="currentStation.name"
              class="w-12 h-12 rounded-ios object-cover cursor-pointer"
              @click="goToDetail"
            />
            <div
              v-if="isPlaying"
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-ios-green rounded-full animate-pulse"
            ></div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-medium text-ios-dark-gray dark:text-dark-text truncate text-sm">
                {{ currentStation.name }}
              </h4>
              <span v-if="isBuffering" class="text-xs text-ios-gray animate-pulse">
                缓冲中...
              </span>
            </div>
            <p class="text-xs text-ios-gray dark:text-dark-secondary truncate">
              {{ getCountryName(currentStation.countrycode) }}
            </p>
          </div>
        </div>

        <!-- 播放控制 -->
        <div class="flex items-center gap-1 md:gap-2">
          <!-- 收藏按钮 -->
          <button
            @click="toggleFavorite"
            class="p-2 rounded-full transition-all active:scale-95 hover:bg-gray-100 dark:hover:bg-dark-gray"
            :class="isFavorite ? 'text-ios-red' : 'text-ios-gray dark:text-dark-secondary'"
          >
            <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorite }" />
          </button>

          <!-- 上一首 -->
          <button
            @click="previousStation"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-all active:scale-95 text-ios-gray dark:text-dark-secondary"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>

          <!-- 播放/暂停 -->
          <button
            @click="togglePlayback"
            :disabled="isLoading"
            class="p-3 bg-ios-blue text-white rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <component
              :is="playButtonIcon"
              class="w-5 h-5"
              :class="{ 'animate-spin': isLoading }"
            />
          </button>

          <!-- 下一首 -->
          <button
            @click="nextStation"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-all active:scale-95 text-ios-gray dark:text-dark-secondary"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>

          <!-- 睡眠定时器 -->
          <SleepTimer />

          <!-- 关闭按钮 -->
          <button
            @click="closePlayer"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-all active:scale-95 text-ios-gray dark:text-dark-secondary"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mt-2 flex items-center gap-2">
        <span class="text-xs text-ios-gray dark:text-dark-secondary tabular-nums">
          {{ formattedCurrentTime }}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          :value="progress"
          @input="onProgressChange"
          class="flex-1 h-1 bg-gray-200 dark:bg-dark-gray rounded-full appearance-none cursor-pointer accent-ios-blue"
        />
        <span class="text-xs text-ios-gray dark:text-dark-secondary tabular-nums">
          {{ formattedDuration }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useRadioStore } from '@/stores/radio'
import { useLanguageStore } from '@/stores/language'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'
import { platform } from '@/utils/platform'

import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import SleepTimer from './SleepTimer.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const radioStore = useRadioStore()
const languageStore = useLanguageStore()

const faviconError = ref(false)
const isMobile = computed(() => platform.isMobile())

const currentStation = computed(() => playerStore.currentStation)
const isPlaying = computed(() => playerStore.isPlaying)
const isLoading = computed(() => playerStore.isLoading)
const isBuffering = computed(() => playerStore.isBuffering)
const isFavorite = computed(() => {
  if (!currentStation.value) return false
  return favoritesStore.isFavorite(currentStation.value.stationuuid)
})
const progress = computed(() => playerStore.progress)
const formattedCurrentTime = computed(() => playerStore.formattedCurrentTime)
const formattedDuration = computed(() => playerStore.formattedDuration)

const playButtonIcon = computed(() => {
  if (isLoading.value) return ArrowPathIcon
  return isPlaying.value ? PauseIcon : PlayIcon
})

const generatedIconUrl = computed(() => {
  return currentStation.value ? generateIconDataUrl(currentStation.value.name) : ''
})

const getCountryName = (countryCode?: string) => {
  if (!countryCode) return languageStore.t('common.unknown')
  return getLocalizedCountryName(countryCode)
}

const togglePlayback = () => {
  playerStore.togglePlayback()
}

const toggleFavorite = () => {
  if (currentStation.value) {
    favoritesStore.toggleFavorite(currentStation.value)
  }
}

const goToDetail = () => {
  if (currentStation.value) {
    router.push(`/station/${currentStation.value.stationuuid}`)
  }
}

const closePlayer = () => {
  playerStore.stopStation()
}

const previousStation = () => {
  // 从历史记录中获取上一首
  const { getPreviousStation } = useHistoryStore()
  const prev = getPreviousStation()
  if (prev) {
    playerStore.playStation(prev)
  }
}

const nextStation = () => {
  // 从历史记录或推荐中获取下一首
  const { getNextStation } = useHistoryStore()
  const next = getNextStation()
  if (next) {
    playerStore.playStation(next)
  } else if (radioStore.topStations.length > 0) {
    // 从热门电台中随机选择
    const randomIndex = Math.floor(Math.random() * radioStore.topStations.length)
    playerStore.playStation(radioStore.topStations[randomIndex])
  }
}

const onProgressChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  const time = (value / 100) * playerStore.duration
  playerStore.seek(time)
}
</script>

<style scoped>
.player-bar {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
}

.dark .player-bar {
  background: rgba(28, 28, 30, 0.92);
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark input[type="range"]::-webkit-slider-thumb {
  border-color: #1C1C1E;
}

input[type="range"]::-moz-range-thumb {
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark input[type="range"]::-moz-range-thumb {
  border-color: #1C1C1E;
}
</style>
