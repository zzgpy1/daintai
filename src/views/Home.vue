<template>
  <div class="home-page">
    <header class="mobile:block desktop:hidden sticky top-0 z-30 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between min-h-[44px]">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-ios-dark-gray dark:text-dark-text leading-tight max-w-[65%] break-words">{{ t('home.title') }}</h1>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="py-6 space-y-8 pb-24 md:pb-28">
      <section>
        <div class="grid grid-cols-2 gap-4 mobile:grid-cols-2 desktop:grid-cols-4">
          <button @click="loadRandomStations" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95 bg-gradient-to-br from-ios-blue to-purple-600 text-white border-0">
            <p class="font-semibold text-white text-lg mb-1">{{ t('home.randomDiscover') }}</p>
            <p class="text-sm text-white/80">{{ t('home.exploreNew') }}</p>
          </button>
          <button @click="$router.push('/search')" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95">
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ t('nav.search') }}</p>
          </button>
          <button @click="$router.push('/settings')" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95">
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ t('nav.settings') }}</p>
          </button>
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-ios-dark-gray dark:text-dark-text">{{ t('home.musicStations') }}</h2>
          <button @click="refreshTopStations" class="px-3 py-1 bg-ios-blue text-white rounded-lg text-sm">刷新</button>
        </div>
        <div class="space-y-3">
          <StationCard v-for="station in topStations" :key="station.stationuuid" :station="station" @play="playStation" @favorite="toggleFavorite" />
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-ios-dark-gray dark:text-dark-text">🇨🇳 国内热门</h2>
          <button @click="refreshChineseStations" class="px-3 py-1 bg-ios-blue text-white rounded-lg text-sm">刷新</button>
        </div>
        <div class="space-y-3">
          <StationCard v-for="station in chineseStations" :key="station.stationuuid" :station="station" @play="playStation" @favorite="toggleFavorite" />
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
import type { RadioStation } from '@/types/radio'
import StationCard from '@/components/StationCard.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'

const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const topStations = ref<RadioStation[]>([])
const chineseStations = ref<RadioStation[]>([])

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  playerStore.toggleFavorite(station)
}

const loadRandomStations = async () => {
  await radioStore.loadRandomStations()
}

const refreshTopStations = async () => {
  await radioStore.loadTopStations({ force: true })
  topStations.value = radioStore.topStations.slice(0, 10)
}

const refreshChineseStations = async () => {
  const results = await radioStore.loadChineseStations(15)
  chineseStations.value = results
}

onMounted(async () => {
  await radioStore.loadTopStations()
  topStations.value = radioStore.topStations.slice(0, 10)
  const results = await radioStore.loadChineseStations(15)
  chineseStations.value = results
})
</script>
