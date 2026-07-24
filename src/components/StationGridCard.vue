<template>
  <div class="station-grid-card ios-card p-4 hover:shadow-ios-lg dark:hover:shadow-dark-ios-lg transition-all">
    <router-link :to="`/station/${station.stationuuid}`" class="block text-center">
      <div class="relative mx-auto mb-3 w-16 h-16">
        <img
          v-if="station.favicon && !showFallback"
          :src="station.favicon"
          :alt="station.name"
          class="w-full h-full rounded-ios object-cover"
          @error="showFallback = true"
        />
        <img
          v-else
          :src="generatedIconUrl"
          :alt="station.name"
          class="w-full h-full rounded-ios object-cover"
        />
        <div
          v-if="isCurrentStation && playerStore.isPlaying"
          class="absolute -bottom-1 -right-1 w-5 h-5 bg-ios-blue rounded-full flex items-center justify-center"
        >
          <div class="w-2.5 h-2.5 bg-white rounded-full playing-animation"></div>
        </div>
      </div>

      <h3 class="font-medium text-ios-dark-gray dark:text-white truncate">{{ station.name }}</h3>
      <p class="text-sm text-ios-gray dark:text-dark-secondary truncate">{{ getCountryName(station.country) }}</p>
    </router-link>

    <div class="flex justify-center gap-2 mt-3">
      <button
        @click="toggleFavorite"
        class="p-2 rounded-full transition-all active:scale-95"
        :class="[
          isFavorited
            ? 'text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-ios-gray dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-gray'
        ]"
      >
        <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
      </button>

      <button
        @click="handlePlay"
        :disabled="isLoading"
        class="p-3 rounded-full transition-all active:scale-95"
        :class="[
          isCurrentStation && playerStore.isPlaying
            ? 'bg-ios-blue text-white'
            : 'bg-ios-light-gray dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-light-gray'
        ]"
      >
        <component :is="playButtonIcon" class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
      </button>

      <button
        @click="shareStation"
        class="p-2 rounded-full transition-all active:scale-95 text-ios-gray dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-gray"
      >
        <ShareIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'
import { PlayIcon, PauseIcon, HeartIcon, ArrowPathIcon, ShareIcon } from '@heroicons/vue/24/outline'

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

const playerStore = usePlayerStore()
const { t } = useLanguageStore()
const showFallback = ref(false)

const isCurrentStation = computed(() => {
  return playerStore.currentStation?.stationuuid === props.station.stationuuid
})

const isLoading = computed(() => {
  return isCurrentStation.value && playerStore.isLoading
})

const isFavorited = computed(() => {
  return playerStore.isStationFavorite(props.station.stationuuid)
})

const playButtonIcon = computed(() => {
  if (isLoading.value) return ArrowPathIcon
  if (isCurrentStation.value && playerStore.isPlaying) return PauseIcon
  return PlayIcon
})

const generatedIconUrl = computed(() => {
  return generateIconDataUrl(props.station.name)
})

const getCountryName = (country: string) => {
  if (!country) return t('common.unknown')
  return getLocalizedCountryName(country)
}

const handlePlay = () => {
  if (isCurrentStation.value && playerStore.isPlaying) {
    playerStore.pauseStation()
  } else {
    emit('play', props.station)
  }
}

const toggleFavorite = () => {
  emit('favorite', props.station)
}

const shareStation = () => {
  emit('share', props.station)
}
</script>

<style scoped>
.playing-animation {
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.5; }
}
</style>
