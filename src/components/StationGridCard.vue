<template>
  <div class="station-grid-card ios-card p-4 hover:shadow-ios-lg dark:hover:shadow-dark-ios-lg transition-all">
    <router-link :to="`/station/${station.stationuuid}`" class="block text-center">
      <div class="relative mx-auto mb-3 w-16 h-16">
        <img :src="stationIcon" :alt="station.name" class="w-full h-full rounded-ios object-cover" />
      </div>
      <h3 class="font-medium text-ios-dark-gray dark:text-white truncate">{{ station.name }}</h3>
      <p class="text-sm text-ios-gray dark:text-dark-secondary truncate">{{ getCountryName(station.country) }}</p>
    </router-link>
    <div class="flex justify-center gap-2 mt-3">
      <button @click="toggleFavorite" class="p-2 rounded-full" :class="isFavorited ? 'text-ios-red' : 'text-ios-gray'">
        <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
      </button>
      <button @click="handlePlay" class="p-2 rounded-full" :class="isCurrentAndPlaying ? 'bg-ios-blue text-white' : 'bg-ios-light-gray dark:bg-dark-gray'">
        <component :is="playButtonIcon" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ station: RadioStation }>()
const emit = defineEmits<{ play: [station: RadioStation], favorite: [station: RadioStation] }>()

const playerStore = usePlayerStore()

const stationIcon = computed(() => {
  return props.station.favicon || generateIconDataUrl(props.station.name)
})

const isFavorited = computed(() => {
  return playerStore.isStationFavorite(props.station.stationuuid)
})

const isCurrentAndPlaying = computed(() => {
  return playerStore.currentStation?.stationuuid === props.station.stationuuid && playerStore.isPlaying
})

const playButtonIcon = computed(() => {
  return isCurrentAndPlaying.value ? PauseIcon : PlayIcon
})

const getCountryName = (country: string) => {
  return country ? getLocalizedCountryName(country) : ''
}

const handlePlay = () => {
  emit('play', props.station)
}

const toggleFavorite = () => {
  emit('favorite', props.station)
}
</script>
