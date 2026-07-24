<template>
  <div class="home-page">
    <header class="sticky top-0 z-30 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between">
        <h1 class="text-lg sm:text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('home.title') }}</h1>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="container-responsive py-6">
      <!-- 快速操作 -->
      <section class="grid grid-cols-2 gap-4 mb-8">
        <button @click="loadRandomStations" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all">
          <ArrowsRightLeftIcon class="w-8 h-8 text-ios-blue mx-auto mb-2" />
          <p class="font-medium">{{ t('home.randomDiscover') }}</p>
        </button>
        <button @click="$router.push('/search')" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all">
          <MagnifyingGlassIcon class="w-8 h-8 text-ios-green mx-auto mb-2" />
          <p class="font-medium">{{ t('nav.search') }}</p>
        </button>
      </section>

      <!-- 热门电台 -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">{{ t('home.musicStations') }}</h2>
          <button @click="loadTopStations" class="p-2 rounded-full hover:bg-gray-100 transition-all">
            <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
        
        <div v-if="isLoading && topStations.length === 0" class="space-y-3">
          <StationSkeleton v-for="i in 4" :key="i" />
        </div>
        
        <div v-else class="space-y-3">
          <StationCard
            v-for="station in topStations.slice(0, 8)"
            :key="station.stationuuid"
            :station="station"
            @play="playStation"
            @favorite="toggleFavorite"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useRadioStore } from '@/stores/radio'
import { useLanguageStore } from '@/stores/language'
import { ArrowPathIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'

const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const { t } = useLanguageStore()

const topStations = ref([])
const isLoading = ref(false)

const loadTopStations = async () => {
  isLoading.value = true
  try {
    const result = await radioStore.loadTopStations()
    topStations.value = result
  } finally {
    isLoading.value = false
  }
}

const loadRandomStations = async () => {
  await radioStore.loadRandomStations()
  const stations = radioStore.stations
  if (stations.length > 0) {
    const random = stations[Math.floor(Math.random() * stations.length)]
    await playStation(random)
  }
}

const playStation = async (station: any) => {
  await playerStore.playStation(station)
}

const toggleFavorite = (station: any) => {
  playerStore.toggleFavorite(station)
}

onMounted(() => {
  loadTopStations()
})
</script>
