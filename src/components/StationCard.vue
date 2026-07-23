<template>
  <div class="station-card ios-card p-3 hover:shadow-ios-lg dark:hover:shadow-dark-ios-lg transition-all cursor-pointer" @click="goToDetail">
    <div class="flex items-center gap-3">
      <div class="flex-shrink-0">
        <img :src="stationIcon" :alt="station.name" class="w-12 h-12 rounded-lg object-cover shadow-sm" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base leading-tight text-ios-dark-gray dark:text-white truncate">{{ station.name }}</h3>
        <span class="text-xs text-ios-gray dark:text-dark-secondary truncate">{{ getCountryName(station.countrycode) }}</span>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button @click.stop="handleFavorite" class="p-2 rounded-lg transition-all" :class="isFavorited ? 'text-ios-red' : 'text-gray-400'">
          <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
        </button>
        <button @click.stop="handlePlay" class="p-2 rounded-lg transition-all" :class="isCurrentAndPlaying ? 'bg-ios-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'">
          <component :is="playButtonIcon" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ station: RadioStation }>()
const emit = defineEmits<{ play: [station: RadioStation], favorite: [station: RadioStation] }>()

const router = useRouter()
const playerStore = usePlayerStore()
const languageStore = useLanguageStore()

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

const getCountryName = (code?: string) => {
  return code ? getLocalizedCountryName(code) : ''
}

const handlePlay = () => {
  emit('play', props.station)
}

const handleFavorite = () => {
  emit('favorite', props.station)
}

const goToDetail = () => {
  router.push(`/station/${props.station.stationuuid}`)
}
</script>
