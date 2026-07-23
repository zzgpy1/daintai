<template>
  <div class="favorites-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('favorites.title') }}</h1>
        <button v-if="favorites.length > 0" @click="clearFavorites" class="text-ios-red text-sm font-medium">
          {{ t('favorites.clearAll') }}
        </button>
      </div>

      <div v-if="favorites.length > 0" class="space-y-3">
        <StationCard v-for="station in favorites" :key="station.stationuuid" :station="station" @play="playStation" @favorite="toggleFavorite" />
      </div>
      <div v-else class="text-center py-12">
        <p class="text-ios-gray dark:text-dark-secondary">{{ t('favorites.empty') }}</p>
        <p class="text-sm text-ios-gray dark:text-dark-secondary mt-2">{{ t('favorites.emptyHint') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import StationCard from '@/components/StationCard.vue'

const playerStore = usePlayerStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const favorites = ref(playerStore.favorites)

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  playerStore.toggleFavorite(station)
  favorites.value = playerStore.favorites
}

const clearFavorites = () => {
  playerStore.clearFavorites()
  favorites.value = []
}
</script>
