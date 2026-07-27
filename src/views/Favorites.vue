<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-24">
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-gray px-4 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <BackButton />
          <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('favorites.title') }}</h1>
        </div>
        <button v-if="favorites.length > 0" @click="clearAll" class="text-ios-red text-sm hover:underline">
          {{ $t('favorites.clearAll') }}
        </button>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <div v-if="favorites.length === 0" class="text-center py-16">
        <HeartIcon class="w-16 h-16 text-ios-light-gray dark:text-dark-secondary mx-auto mb-4" />
        <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('favorites.empty') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">{{ $t('favorites.emptyHint') }}</p>
        <router-link to="/" class="inline-block mt-4 px-6 py-2 bg-ios-blue text-white rounded-ios hover:bg-blue-600">
          {{ $t('home.title') }}
        </router-link>
      </div>

      <div v-else class="space-y-3">
        <StationCard
          v-for="fav in favorites"
          :key="fav.stationuuid"
          :station="convertToStation(fav)"
        />
      </div>
    </div>

    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import type { RadioStation, FavoriteStation } from '@/types/radio'
import BackButton from '@/components/common/BackButton.vue'
import StationCard from '@/components/common/StationCard.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'
import { HeartIcon } from '@heroicons/vue/24/outline'

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const favorites = computed(() => favoritesStore.favorites)

const convertToStation = (fav: FavoriteStation): RadioStation => {
  return {
    stationuuid: fav.stationuuid,
    name: fav.name,
    url: fav.url,
    url_resolved: fav.url,
    homepage: '',
    favicon: fav.favicon,
    tags: '',
    country: fav.country,
    countrycode: '',
    state: '',
    language: '',
    languagecodes: '',
    votes: 0,
    codec: '',
    bitrate: 0,
    hls: 0,
    lastcheckok: 0,
    clickcount: 0,
    clicktrend: 0,
    geo_lat: null,
    geo_long: null
  }
}

const clearAll = () => {
  if (confirm('确定要清空所有收藏吗？')) {
    favoritesStore.clearFavorites()
    toastStore.showInfo('已清空收藏')
  }
}
</script>
