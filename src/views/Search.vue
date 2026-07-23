<template>
  <div class="search-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4">
      <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text mb-4">{{ t('search.title') }}</h1>

      <div class="ios-card p-4 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search.placeholder')"
          class="w-full px-4 py-3 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 outline-none transition-all"
          @input="onSearch"
        />
      </div>

      <div v-if="isLoading" class="space-y-3">
        <StationSkeleton v-for="i in 5" :key="i" />
      </div>
      <div v-else-if="results.length > 0" class="space-y-3">
        <StationCard
          v-for="station in results"
          :key="station.stationuuid"
          :station="station"
          @play="playStation"
          @favorite="toggleFavorite"
        />
      </div>
      <div v-else class="text-center py-12">
        <p class="text-ios-gray dark:text-dark-secondary">{{ t('search.noResults') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useRadioStore } from '@/stores/radio'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'

const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const searchQuery = ref('')
const results = ref<RadioStation[]>([])
const isLoading = ref(false)

const onSearch = async () => {
  if (searchQuery.value.length > 0) {
    isLoading.value = true
    await radioStore.searchStations({ name: searchQuery.value })
    results.value = radioStore.stations
    isLoading.value = false
  } else {
    results.value = []
  }
}

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  playerStore.toggleFavorite(station)
}

onMounted(() => {
  radioStore.resetSearch()
})
</script>
