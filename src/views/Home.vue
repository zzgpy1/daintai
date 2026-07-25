<template>
  <div class="home-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 移动端标题栏 -->
    <header class="mobile:block desktop:hidden sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between min-h-[44px]">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-ios-dark-gray dark:text-dark-text leading-tight max-w-[65%] break-words">
          {{ $t('home.title') }}
        </h1>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- PC端标题 -->
    <div class="mobile:hidden desktop:block px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('home.subtitle') }}</h1>
        <div class="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </div>

    <div class="container-responsive py-6 space-y-8 pb-24 md:pb-28">
      <!-- 快捷操作 -->
      <section>
        <div class="grid grid-cols-2 gap-4 mobile:grid-cols-2 tablet:grid-cols-2 desktop:grid-cols-4">
          <button 
            @click="loadRandomStations"
            class="relative overflow-hidden ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95 bg-gradient-to-br from-ios-blue to-purple-600 dark:from-ios-blue dark:to-purple-700 text-white border-0"
          >
            <div class="relative z-10 mb-3">
              <div class="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <ArrowsRightLeftIcon class="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
            <p class="font-semibold text-white text-lg mb-1">{{ $t('home.randomDiscover') }}</p>
            <p class="text-sm text-white/80">{{ $t('home.exploreNew') }}</p>
          </button>
          
          <button 
            @click="$router.push('/search')"
            class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95"
          >
            <MagnifyingGlassIcon class="w-8 h-8 text-ios-green mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('nav.search') }}</p>
            <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">{{ $t('home.findFavorites') }}</p>
          </button>
          
          <button 
            @click="$router.push('/history')"
            class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95 hidden desktop:block"
          >
            <ClockIcon class="w-8 h-8 text-ios-purple mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('nav.history') }}</p>
            <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">{{ $t('history.viewRecords') }}</p>
          </button>
          
          <button 
            @click="$router.push('/favorites')"
            class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95 hidden desktop:block"
          >
            <HeartIcon class="w-8 h-8 text-ios-red mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('nav.favorites') }}</p>
            <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">{{ $t('home.savedStations') }}</p>
          </button>
        </div>
      </section>

      <!-- 热门电台 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('home.popularStations') }}</h2>
          <button
            @click="refreshTopStations"
            :disabled="isLoadingTopStations"
            class="p-2 rounded-full bg-ios-blue/10 hover:bg-ios-blue/20 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon :class="['w-5 h-5 text-ios-blue', { 'animate-spin': isLoadingTopStations }]" />
          </button>
        </div>
        
        <div v-if="isLoadingTopStations && topStations.length === 0" class="space-y-3">
          <StationSkeleton v-for="i in 5" :key="i" />
        </div>
        
        <div v-else-if="topStations.length > 0" class="space-y-3">
          <StationCard 
            v-for="station in topStations.slice(0, 10)" 
            :key="station.stationuuid"
            :station="station"
            @play="playStation"
            @favorite="toggleFavorite"
            @share="openShareModal"
          />
        </div>
        
        <div v-else class="text-center py-8 text-ios-gray dark:text-dark-secondary">
          {{ $t('home.noStations') }}
        </div>
      </section>

      <!-- 最新电台 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('home.latestStations') }}</h2>
        </div>
        
        <div v-if="isLoadingLatestStations && latestStations.length === 0" class="space-y-3">
          <StationSkeleton v-for="i in 5" :key="i" />
        </div>
        
        <div v-else-if="latestStations.length > 0" class="space-y-3">
          <StationCard 
            v-for="station in latestStations.slice(0, 10)" 
            :key="station.stationuuid"
            :station="station"
            @play="playStation"
            @favorite="toggleFavorite"
            @share="openShareModal"
          />
        </div>
        
        <div v-else class="text-center py-8 text-ios-gray dark:text-dark-secondary">
          {{ $t('home.noStations') }}
        </div>
      </section>
    </div>

    <!-- 分享模态框 -->
    <ShareModal
      :visible="isShareModalVisible"
      :station="stationToShare"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import type { RadioStation } from '@/types/radio'

import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'
import ShareModal from '@/components/ShareModal.vue'

const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()

// 使用 computed 获取响应式数据
const topStations = computed(() => radioStore.topStations)
const latestStations = computed(() => radioStore.latestStations)
const isLoadingTopStations = computed(() => radioStore.isLoadingTopStations)
const isLoadingLatestStations = computed(() => radioStore.isLoadingLatestStations)

const isShareModalVisible = ref(false)
const stationToShare = ref<RadioStation | null>(null)

const playStation = async (station: RadioStation) => {
  await playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  favoritesStore.toggleFavorite(station)
}

const refreshTopStations = async () => {
  await radioStore.loadTopStations({ force: true })
}

const loadRandomStations = async () => {
  await radioStore.loadRandomStations()
  if (radioStore.stations.length > 0) {
    const randomStation = radioStore.stations[Math.floor(Math.random() * radioStore.stations.length)]
    await playerStore.playStation(randomStation)
  }
}

const openShareModal = (station: RadioStation) => {
  stationToShare.value = station
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
  stationToShare.value = null
}

onMounted(async () => {
  await Promise.all([
    radioStore.loadTopStations(),
    radioStore.loadLatestStations()
  ])
})
</script>
