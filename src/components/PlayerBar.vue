<template>
  <div v-if="playerStore.currentStation" class="player-bar block md:hidden fixed left-0 right-0 z-20 glass-effect border-t border-gray-300/60 dark:border-dark-gray px-4 py-3" style="bottom: 88px;">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="flex-shrink-0">
          <img :src="stationIcon" :alt="playerStore.currentStation.name" class="w-12 h-12 rounded-ios object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-ios-dark-gray dark:text-dark-text truncate text-sm">{{ playerStore.currentStation.name }}</h4>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="toggleFavorite" class="p-2 rounded-full" :class="isFavorite ? 'text-ios-red' : 'text-ios-gray'">
          <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorite }" />
        </button>
        <button @click="togglePlayback" class="p-3 bg-ios-blue text-white rounded-full hover:bg-blue-600 transition-all">
          <component :is="playButtonIcon" class="w-5 h-5" />
        </button>
        <button @click="closePlayer" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
          <XMarkIcon class="w-5 h-5 text-ios-gray" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { PlayIcon, PauseIcon, HeartIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()

const stationIcon = computed(() => {
  const station = playerStore.currentStation
  return station?.favicon || generateIconDataUrl(station?.name || '')
})

const isFavorite = computed(() => {
  const station = playerStore.currentStation
  return station ? playerStore.isStationFavorite(station.stationuuid) : false
})

const playButtonIcon = computed(() => {
  return playerStore.isPlaying ? PauseIcon : PlayIcon
})

const togglePlayback = () => {
  if (playerStore.isPlaying) {
    playerStore.pauseStation()
  } else {
    playerStore.resumeStation()
  }
}

const toggleFavorite = () => {
  if (playerStore.currentStation) {
    playerStore.toggleFavorite(playerStore.currentStation)
  }
}

const closePlayer = () => {
  playerStore.stopStation()
}
</script>
