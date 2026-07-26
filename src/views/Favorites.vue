<template>
  <div class="favorites-page">
    <!-- 标题栏 -->
    <header class="sticky top-0 z-20 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="container-responsive">
        <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">
          {{ $t('favorites.title') }}
        </h1>
      </div>
    </header>

    <div class="container-responsive py-4">
      <!-- 收藏列表 -->
      <div v-if="favoritesStore.totalFavorites > 0" class="space-y-3">
        <StationCard
          v-for="favorite in favoritesStore.favorites"
          :key="favorite.stationuuid"
          :station="convertToStation(favorite)"
          @play="playStation"
          @favorite="toggleFavorite"
          @share="openShareModal"
        />
        
        <!-- 清空按钮 -->
        <div class="text-center py-4">
          <button
            @click="clearAllFavorites"
            class="text-sm text-ios-red hover:underline"
          >
            {{ $t('favorites.clearAll') }}
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-dark-gray rounded-full flex items-center justify-center mb-4">
          <HeartIcon class="w-8 h-8 text-ios-gray" />
        </div>
        <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text mb-2">
          {{ $t('favorites.empty') }}
        </h3>
        <p class="text-ios-gray dark:text-dark-secondary mb-6">
          {{ $t('favorites.emptyHint') }}
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link
            to="/"
            class="px-6 py-3 bg-ios-blue text-white rounded-ios font-medium hover:bg-blue-600 transition-colors"
          >
            {{ $t('favorites.browseStations') }}
          </router-link>
          <router-link
            to="/search"
            class="px-6 py-3 border border-ios-blue text-ios-blue rounded-ios font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            {{ $t('favorites.searchStations') }}
          </router-link>
        </div>
      </div>
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
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import type { RadioStation, FavoriteStation } from '@/types/radio'
import { HeartIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import ShareModal from '@/components/ShareModal.vue'

const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const isShareModalVisible = ref(false)
const shareStation = ref<RadioStation | null>(null)

const convertToStation = (favorite: FavoriteStation): RadioStation => {
  return {
    stationuuid: favorite.stationuuid,
    name: favorite.name,
    url: favorite.url,
    url_resolved: favorite.url,
    favicon: favorite.favicon,
    country: favorite.country,
    tags: '',
    language: '',
    // 其他必要字段使用默认值
    homepage: '',
    countrycode: '',
    state: '',
    languagecodes: '',
    votes: 0,
    lastchangetime: '',
    lastchangetime_iso8601: '',
    codec: '',
    bitrate: 0,
    hls: 0,
    lastcheckok: 0,
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
    geo_lat: null,
    geo_long: null,
    has_extended_info: false
  }
}

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

const clearAllFavorites = () => {
  if (confirm('确定要清空所有收藏吗？')) {
    favoritesStore.clearFavorites()
    toastStore.showInfo('已清空所有收藏')
  }
}

const openShareModal = (station: RadioStation) => {
  shareStation.value = station
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
  shareStation.value = null
}
</script>
