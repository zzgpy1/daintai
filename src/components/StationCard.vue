<template>
  <div class="station-card ios-card p-3 hover:shadow-ios-lg dark:hover:shadow-dark-ios-lg transition-all cursor-pointer" @click="goToDetail">
    <div class="flex items-center gap-3">
      <!-- 电台图标 -->
      <div class="flex-shrink-0 relative">
        <img
          v-if="station.favicon && !showFallback"
          :src="station.favicon"
          :alt="station.name"
          class="w-12 h-12 rounded-lg object-cover shadow-sm"
          loading="lazy"
          @error="showFallback = true"
        />
        <div v-else class="w-12 h-12 rounded-lg bg-gradient-to-br from-ios-blue to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {{ getInitial(station.name) }}
        </div>
        
        <!-- 播放状态指示器 -->
        <div
          v-if="isCurrentStation && playerStore.isPlaying"
          class="absolute -bottom-1 -right-1 w-4 h-4 bg-ios-blue rounded-full flex items-center justify-center shadow-lg"
        >
          <div class="w-2 h-2 bg-white rounded-full playing-animation"></div>
        </div>
      </div>
      
      <!-- 电台信息 -->
      <div class="flex-1 min-w-0">
        <div ref="containerRef" class="station-name-container mb-1 max-w-full">
          <h3 ref="stationNameRef" class="station-name font-semibold text-base leading-tight text-ios-dark-gray dark:text-white">
            {{ station.name }}
          </h3>
        </div>
        
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-ios-gray dark:text-dark-secondary truncate">
            {{ getCountryName(station.countrycode) }}
          </span>
          <span v-if="station.bitrate" class="text-xs text-ios-gray dark:text-dark-secondary flex-shrink-0">
            {{ station.bitrate }} kbps
          </span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          v-if="variant !== 'history'"
          @click.stop="handleShare"
          class="p-2 rounded-lg transition-all active:scale-95 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-ios-blue"
        >
          <ShareIcon class="w-4 h-4" />
        </button>

        <button
          @click.stop="handleFavorite"
          class="p-2 rounded-lg transition-all active:scale-95 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'text-ios-red dark:text-ios-red': isFavorited }"
        >
          <component :is="isFavorited ? SolidHeartIcon : HeartIcon" class="w-4 h-4" />
        </button>

        <button
          v-if="variant === 'history'"
          @click.stop="handleRemove"
          class="p-2 rounded-lg transition-all active:scale-95 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
        
        <button
          @click.stop="handlePlay"
          :disabled="isLoading"
          class="p-2 rounded-lg transition-all active:scale-95"
          :class="[
            isCurrentStation && playerStore.isPlaying
              ? 'bg-ios-blue text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          <component :is="playButtonIcon" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'

import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  HeartIcon,
  XMarkIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as SolidHeartIcon } from '@heroicons/vue/24/solid'

interface Props {
  station: RadioStation
  variant?: 'favorite' | 'history'
  historyTimestamp?: number
}

interface Emits {
  (e: 'play', station: RadioStation): void
  (e: 'favorite', station: RadioStation): void
  (e: 'share', station: RadioStation): void
  (e: 'remove', timestamp: number): void
}

const props = withDefaults(defineProps<Props>(), { variant: 'favorite' })
const emit = defineEmits<Emits>()

const router = useRouter()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const languageStore = useLanguageStore()

const showFallback = ref(false)
const stationNameRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
let animationId: number | null = null

const isFavorited = computed(() => favoritesStore.isFavorite(props.station.stationuuid))
const isCurrentStation = computed(() => playerStore.currentStation?.stationuuid === props.station.stationuuid)
const isLoading = computed(() => isCurrentStation.value && playerStore.isLoading)

const playButtonIcon = computed(() => {
  if (isLoading.value) return ArrowPathIcon
  if (isCurrentStation.value && playerStore.isPlaying) return PauseIcon
  return PlayIcon
})

const getInitial = (name: string): string => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const getCountryName = (countryCode?: string): string => {
  if (!countryCode) return languageStore.t('common.unknown')
  // 简单映射，实际项目可使用完整翻译
  const map: Record<string, string> = {
    'CN': '中国',
    'US': '美国',
    'GB': '英国',
    'JP': '日本',
    'KR': '韩国'
  }
  return map[countryCode] || countryCode
}

// ============================================
// 标题滚动动画
// ============================================
const checkTextOverflow = async () => {
  await nextTick()
  const container = containerRef.value
  const text = stationNameRef.value

  if (container && text) {
    const overflow = text.scrollWidth - container.clientWidth
    if (overflow > 1) {
      text.style.setProperty('--scroll-amount', `-${overflow}px`)
      const duration = Math.max(2, overflow / 40)
      text.style.setProperty('--animation-duration', `${duration}s`)
      text.classList.add('is-scrolling')
    } else {
      text.classList.remove('is-scrolling')
    }
  }
}

// ============================================
// 事件处理
// ============================================
const handlePlay = () => {
  if (isCurrentStation.value && playerStore.isPlaying) {
    playerStore.pauseStation()
  } else {
    emit('play', props.station)
  }
}

const handleFavorite = () => {
  emit('favorite', props.station)
}

const handleShare = () => {
  emit('share', props.station)
}

const handleRemove = () => {
  if (props.historyTimestamp) {
    emit('remove', props.historyTimestamp)
  }
}

const goToDetail = () => {
  router.push(`/station/${props.station.stationuuid}`)
}

// ============================================
// 生命周期
// ============================================
onMounted(() => {
  checkTextOverflow()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.station-name-container {
  overflow: hidden;
  width: 100%;
}

.station-name {
  display: inline-block;
  white-space: nowrap;
  transform: translateX(0);
}

.station-name.is-scrolling {
  animation: scrollText var(--animation-duration, 2s) linear infinite;
}

@keyframes scrollText {
  0% { transform: translateX(0); }
  25% { transform: translateX(0); }
  75% { transform: translateX(var(--scroll-amount, -50px)); }
  100% { transform: translateX(var(--scroll-amount, -50px)); }
}

.playing-animation {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0.4; transform: scale(0.8); }
}
</style>
