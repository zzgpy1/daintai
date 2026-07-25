<template>
  <div 
    class="station-card ios-card p-3 hover:shadow-ios-lg dark:hover:shadow-dark-ios-lg transition-all cursor-pointer group"
    @click="goToDetail"
  >
    <div class="flex items-center gap-3">
      <!-- 电台图标 -->
      <div class="flex-shrink-0 relative">
        <img
          v-if="station.favicon && !showFallback"
          :src="station.favicon"
          :alt="station.name"
          class="w-12 h-12 rounded-lg object-cover shadow-sm"
          @error="showFallback = true"
        />
        <img
          v-else
          :src="generatedIconUrl"
          :alt="station.name"
          class="w-12 h-12 rounded-lg object-cover shadow-sm"
        />
        
        <!-- 播放状态指示器 -->
        <div
          v-if="isCurrentStation && isPlaying"
          class="absolute -bottom-1 -right-1 w-4 h-4 bg-ios-blue rounded-full flex items-center justify-center shadow-lg"
        >
          <div class="w-2 h-2 bg-white rounded-full playing-animation"></div>
        </div>
      </div>
      
      <!-- 电台信息 -->
      <div class="flex-1 min-w-0">
        <div ref="containerRef" class="station-name-container mb-1 max-w-full">
          <h3 
            ref="stationNameRef"
            class="station-name font-semibold text-base leading-tight text-ios-dark-gray dark:text-white"
          >
            {{ station.name }}
          </h3>
        </div>
        
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-ios-gray dark:text-dark-secondary truncate">
            {{ getCountryName(station.countrycode) }}
          </span>
          <span v-if="station.bitrate" class="text-xs text-ios-gray dark:text-dark-secondary">
            {{ station.bitrate }} kbps
          </span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          @click.stop="handleShare"
          class="p-2 rounded-lg transition-all active:scale-95 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-ios-blue"
        >
          <ShareIcon class="w-4 h-4" />
        </button>

        <button
          @click.stop="handleFavorite"
          class="p-2 rounded-lg transition-all active:scale-95"
          :class="[
            isFavorited 
              ? 'text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <component :is="isFavorited ? SolidHeartIcon : HeartIcon" class="w-5 h-5" />
        </button>

        <button
          @click.stop="handlePlay"
          :disabled="isLoading"
          class="p-2 rounded-lg transition-all active:scale-95"
          :class="[
            isCurrentStation && isPlaying
              ? 'bg-ios-blue text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          <component
            :is="playButtonIcon"
            class="w-5 h-5"
            :class="{ 'animate-spin': isLoading }"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'

import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as SolidHeartIcon } from '@heroicons/vue/24/solid'

interface Props {
  station: RadioStation
}

interface Emits {
  (e: 'play', station: RadioStation): void
  (e: 'favorite', station: RadioStation): void
  (e: 'share', station: RadioStation): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const languageStore = useLanguageStore()

const showFallback = ref(false)
const stationNameRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const isCurrentStation = computed(() => {
  return playerStore.currentStation?.stationuuid === props.station.stationuuid
})

const isPlaying = computed(() => playerStore.isPlaying)
const isLoading = computed(() => isCurrentStation.value && playerStore.isLoading)
const isFavorited = computed(() => favoritesStore.isFavorite(props.station.stationuuid))

const playButtonIcon = computed(() => {
  if (isLoading.value) return ArrowPathIcon
  if (isCurrentStation.value && isPlaying.value) return PauseIcon
  return PlayIcon
})

const generatedIconUrl = computed(() => {
  return generateIconDataUrl(props.station.name)
})

const getCountryName = (countryCode?: string) => {
  if (!countryCode) return languageStore.t('common.unknown')
  return getLocalizedCountryName(countryCode)
}

const handlePlay = () => {
  if (isCurrentStation.value && isPlaying.value) {
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

const goToDetail = () => {
  router.push(`/station/${props.station.stationuuid}`)
}

// 标题滚动效果
const checkTextOverflow = async () => {
  await nextTick()
  const container = containerRef.value
  const text = stationNameRef.value

  if (container && text) {
    const overflow = text.scrollWidth - container.clientWidth
    if (overflow > 1) {
      const scrollSpeed = 50
      const duration = overflow / scrollSpeed
      text.style.setProperty('--scroll-amount', `-${overflow}px`)
      text.style.setProperty('--animation-duration', `${duration}s`)
      text.classList.add('is-scrolling')
    }
  }
}

onMounted(() => {
  checkTextOverflow()
})

watch(() => props.station, () => {
  showFallback.value = false
  checkTextOverflow()
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
  animation: scroll-to-end var(--animation-duration, 1s) linear forwards;
}

@keyframes scroll-to-end {
  from { transform: translateX(0); }
  to { transform: translateX(var(--scroll-amount, 0px)); }
}

.playing-animation {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.5; }
}
</style>
