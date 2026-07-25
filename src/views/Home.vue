<template>
  <div class="home-page">
    <!-- 标题栏 -->
    <header class="sticky top-0 z-20 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="container-responsive flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-ios-blue to-ios-purple rounded-lg flex items-center justify-center">
            <RadioIcon class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">
            {{ $t('home.title') }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="refreshAll"
            :disabled="isRefreshing"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-all"
          >
            <ArrowPathIcon 
              class="w-5 h-5 text-ios-gray dark:text-dark-secondary"
              :class="{ 'animate-spin': isRefreshing }"
            />
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="container-responsive py-4 space-y-6">
      <!-- 快速操作 -->
      <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <button 
          @click="randomDiscover"
          class="relative overflow-hidden ios-card p-4 text-center hover:shadow-ios-lg transition-all active:scale-95 bg-gradient-to-br from-ios-blue to-purple-600 text-white border-0"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div class="relative z-10">
            <ArrowsRightLeftIcon class="w-6 h-6 mx-auto mb-2" />
            <p class="font-semibold text-sm">{{ $t('home.randomDiscover') }}</p>
          </div>
        </button>
        
        <router-link 
          to="/search"
          class="ios-card p-4 text-center hover:shadow-ios-lg transition-all active:scale-95"
        >
          <MagnifyingGlassIcon class="w-6 h-6 text-ios-blue mx-auto mb-2" />
          <p class="font-medium text-sm text-ios-dark-gray dark:text-dark-text">{{ $t('nav.search') }}</p>
        </router-link>
        
        <router-link 
          to="/favorites"
          class="ios-card p-4 text-center hover:shadow-ios-lg transition-all active:scale-95 hidden md:block"
        >
          <HeartIcon class="w-6 h-6 text-ios-red mx-auto mb-2" />
          <p class="font-medium text-sm text-ios-dark-gray dark:text-dark-text">{{ $t('nav.favorites') }}</p>
        </router-link>
        
        <router-link 
          to="/history"
          class="ios-card p-4 text-center hover:shadow-ios-lg transition-all active:scale-95 hidden md:block"
        >
          <ClockIcon class="w-6 h-6 text-ios-orange mx-auto mb-2" />
          <p class="font-medium text-sm text-ios-dark-gray dark:text-dark-text">{{ $t('nav.history') }}</p>
        </router-link>
      </section>

      <!-- 热门电台 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">
            {{ $t('home.popularStations') }}
          </h2>
          <button
            @click="loadTopStations"
            class="text-sm text-ios-blue hover:underline"
          >
            {{ $t('home.refresh') }}
          </button>
        </div>
        
        <div v-if="radioStore.isLoading && !radioStore.topStations.length" 
             class="space-y-3">
          <StationSkeleton v-for="i in 5" :key="i" />
        </div>
        
        <div v-else class="space-y-3">
          <StationCard 
            v-for="station in displayStations" 
            :key="station.stationuuid"
            :station="station"
            @play="playStation"
            @favorite="toggleFavorite"
            @share="openShareModal"
          />
        </div>
      </section>

      <!-- 最新电台 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">
            {{ $t('home.latestStations') }}
          </h2>
        </div>
        
        <div v-if="radioStore.isLoading && !radioStore.latestStations.length" 
             class="space-y-3">
          <StationSkeleton v-for="i in 3" :key="i" />
        </div>
        
        <div v-else class="space-y-3">
          <StationCard 
            v-for="station in radioStore.latestStations.slice(0, 5)" 
            :key="station.stationuuid"
            :station="station"
            @play="playStation"
            @favorite="toggleFavorite"
            @share="openShareModal"
          />
        </div>
      </section>
    </div>

    <!-- 分享弹窗 -->
    <ShareModal 
      :visible="isShareModalVisible" 
      :station="shareStation" 
      @close="closeShareModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useRadioStore } from '@/stores/radio'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import type { RadioStation } from '@/types/radio'

import {
  RadioIcon,
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

const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const isRefreshing = ref(false)
const isShareModalVisible = ref(false)
const shareStation = ref<RadioStation | null>(null)

const displayStations = computed(() => {
  return radioStore.topStations.slice(0, 10)
})

const playStation = async (station: RadioStation) => {
  try {
    await playerStore.playStation(station)
  } catch (error) {
    toastStore.showError('播放失败，请稍后重试')
  }
}

const toggleFavorite = (station: RadioStation) => {
  favoritesStore.toggleFavorite(station)
}

const randomDiscover = async () => {
  await radioStore.loadRandomStations(20)
  if (radioStore.stations.length > 0) {
    const randomIndex = Math.floor(Math.random() * radioStore.stations.length)
    await playStation(radioStore.stations[randomIndex])
  }
}

const loadTopStations = async () => {
  isRefreshing.value = true
  await radioStore.loadTopStations()
  isRefreshing.value = false
}

const refreshAll = async () => {
  isRefreshing.value = true
  await Promise.all([
    radioStore.loadTopStations(),
    radioStore.loadLatestStations()
  ])
  isRefreshing.value = false
}

const openShareModal = (station: RadioStation) => {
  shareStation.value = station
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
  shareStation.value = null
}

onMounted(() => {
  if (!radioStore.topStations.length) {
    loadTopStations()
  }
  if (!radioStore.latestStations.length) {
    radioStore.loadLatestStations()
  }
})
</script>
