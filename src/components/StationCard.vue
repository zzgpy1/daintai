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
          @error="showFallback = true"
        />
        <img
          v-else
          :src="generatedIconUrl"
          :alt="station.name"
          class="w-12 h-12 rounded-lg object-cover shadow-sm"
        />
        <div
          v-if="isCurrentStation && playerStore.isPlaying"
          class="absolute -bottom-1 -right-1 w-4 h-4 bg-ios-blue rounded-full flex items-center justify-center shadow-lg"
        >
          <div class="w-2 h-2 bg-white rounded-full playing-animation"></div>
        </div>
      </div>

      <!-- 电台信息 -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base leading-tight text-ios-dark-gray dark:text-white truncate">
          {{ station.name }}
        </h3>
        <p class="text-xs text-ios-gray dark:text-dark-secondary truncate">
          {{ getCountryName(station.countrycode) }}
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          @click.stop="handleShare"
          class="p-2 rounded-lg transition-all active:scale-95 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ShareIcon class="w-5 h-5" />
        </button>

        <button
          @click.stop="handleFavorite"
          class="p-2 rounded-lg transition-all active:scale-95 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'text-ios-red dark:text-ios-red': isFavorited }"
        >
          <component :is="isFavorited ? SolidHeartIcon : HeartIcon" class="w-5 h-5" />
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
          <component :is="playButtonIcon" class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'
import { PlayIcon, PauseIcon, ArrowPathIcon, HeartIcon, XMarkIcon, ShareIcon } from '@heroicons/vue/24/outline'
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
const { t } = useLanguageStore()
const showFallback = ref(false)

const isFavorited = computed(() => {
  return playerStore.isStationFavorite(props.station.stationuuid)
})

const isCurrentStation = computed(() => {
  return playerStore.currentStation?.stationuuid === props.station.stationuuid
})

const isLoading = computed(() => {
  return isCurrentStation.value && playerStore.isLoading
})

const playButtonIcon = computed(() => {
  if (isLoading.value) return ArrowPathIcon
  if (isCurrentStation.value && playerStore.isPlaying) return PauseIcon
  return PlayIcon
})

const generatedIconUrl = computed(() => {
  return generateIconDataUrl(props.station.name)
})

const getCountryName = (countryCode?: string) => {
  if (!countryCode) return t('common.unknown')
  return getLocalizedCountryName(countryCode)
}

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
</script>

<style scoped>
.playing-animation {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.5; }
}
</style>
