<template>
  <div class="favorites-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('favorites.title') }}</h1>
        <button
          v-if="favorites.length > 0"
          @click="clearFavorites"
          class="text-ios-red text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-ios transition-colors"
        >
          {{ t('favorites.clearAll') }}
        </button>
      </div>

      <div v-if="favorites.length > 0" class="space-y-3">
        <StationCard
          v-for="station in favorites"
          :key="station.stationuuid"
          :station="convertToRadioStation(station)"
          @play="playStation"
          @favorite="toggleFavorite"
        />
      </div>
      <div v-else class="text-center py-12">
        <p class="text-ios-gray dark:text-dark-secondary">{{ t('favorites.empty') }}</p>
        <p class="text-sm text-ios-gray dark:text-dark-secondary mt-2">{{ t('favorites.emptyHint') }}</p>
        <div class="mt-4 space-x-3">
          <router-link to="/" class="inline-block px-4 py-2 bg-ios-blue text-white rounded-ios text-sm">
            {{ t('favorites.browseStations') }}
          </router-link>
          <router-link to="/search" class="inline-block px-4 py-2 border border-ios-blue text-ios-blue rounded-ios text-sm">
            {{ t('favorites.searchStations') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation, FavoriteStation } from '@/types/radio'
import StationCard from '@/components/StationCard.vue'

const playerStore = usePlayerStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const favorites = ref(playerStore.favorites)

const convertToRadioStation = (favorite: FavoriteStation): RadioStation => {
  return {
    stationuuid: favorite.stationuuid,
    name: favorite.name,
    url: favorite.url,
    url_resolved: favorite.url,
    homepage: '',
    favicon: favorite.favicon,
    tags: '',
    country: favorite.country,
    countrycode: '',
    state: '',
    language: '',
    languagecodes: '',
    votes: 0,
    lastchangetime: '',
    lastchangetime_iso8601: '',
    codec: '',
    bitrate: 0,
    hls: 0,
    lastcheckok: 1,
    lastchecktime: '',
    lastchecktime_iso8601: '',
    lastcheckoktime: '',
    lastcheckoktime_iso8601: '',
    lastlocalchecktime: '',
    lastlocalchecktime_iso8601: '',
    clicktimestamp: '',
    clicktimestamp_iso8601: '',
    clickcount: 0,
    clicktrend: 0,
    ssl_error: 0,
    geo_lat: 0,
    geo_long: 0,
    has_extended_info: false
  }
}

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
