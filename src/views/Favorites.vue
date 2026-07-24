<template>
  <div class="favorites-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <header class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between">
        <h1 class="text-lg sm:text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('nav.favorites') }}</h1>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            v-if="favorites.length > 0"
            @click="showClearDialog = true"
            class="text-ios-red text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-ios transition-colors"
          >
            {{ t('favorites.clearAll') }}
          </button>
        </div>
      </div>
    </header>

    <div class="container-responsive py-4">
      <!-- 收藏列表 -->
      <div v-if="favorites.length > 0" class="space-y-3">
        <StationCard
          v-for="station in favorites"
          :key="station.stationuuid"
          :station="convertToRadioStation(station)"
          @play="playStation"
          @favorite="removeFavorite"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div class="text-center">
          <HeartIcon class="w-16 h-16 text-ios-light-gray dark:text-dark-secondary mx-auto mb-4" />
          <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text mb-2">{{ t('favorites.empty') }}</h3>
          <p class="text-ios-gray dark:text-dark-secondary mb-6">{{ t('favorites.emptyHint') }}</p>
          <router-link to="/" class="ios-button-primary inline-block">
            {{ t('favorites.browseStations') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div
      v-if="showClearDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showClearDialog = false"
    >
      <div class="bg-white dark:bg-dark-surface rounded-ios p-6 mx-4 max-w-sm w-full" @click.stop>
        <h3 class="text-lg font-semibold mb-2">{{ t('favorites.clearConfirmTitle') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mb-6">{{ t('favorites.clearConfirmMessage') }}</p>
        <div class="flex gap-3">
          <button @click="showClearDialog = false" class="flex-1 ios-button-secondary py-3">
            {{ t('common.cancel') }}
          </button>
          <button @click="clearAllFavorites" class="flex-1 bg-ios-red text-white py-3 rounded-ios font-medium">
            {{ t('favorites.clear') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation, FavoriteStation } from '@/types/radio'
import { HeartIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const playerStore = usePlayerStore()
const { t } = useLanguageStore()

const favorites = computed(() => playerStore.favorites)
const showClearDialog = ref(false)

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

const removeFavorite = (station: RadioStation) => {
  playerStore.removeFavorite(station.stationuuid)
}

const clearAllFavorites = () => {
  playerStore.clearFavorites()
  showClearDialog.value = false
}
</script>
