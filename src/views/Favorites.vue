<template>
  <div class="favorites-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 标题栏 -->
    <div class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between min-h-[44px]">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-ios-dark-gray dark:text-dark-text leading-tight max-w-[65%] break-words">
          {{ $t('nav.favorites') }}
        </h1>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            v-if="favoritesStore.count > 0"
            @click="showClearDialog = true"
            class="text-ios-red text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-ios transition-colors"
          >
            {{ $t('favorites.clearAll') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 收藏列表 -->
    <div v-if="favoritesStore.count > 0" class="container-responsive p-4">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-ios-gray dark:text-dark-secondary">
          {{ $t('favorites.total') || '总计' }}: {{ favoritesStore.count }} {{ $t('favorites.stations') || '个电台' }}
        </span>
      </div>
      
      <div class="space-y-3">
        <StationCard
          v-for="station in favoriteStations"
          :key="station.stationuuid"
          :station="station"
          @play="playStation"
          @favorite="handleRemoveFavorite"
          @share="openShareModal"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div class="text-center">
        <HeartIcon class="w-16 h-16 text-ios-light-gray dark:text-dark-secondary mx-auto mb-4" />
        <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text mb-2">{{ $t('favorites.empty') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mb-6">{{ $t('favorites.emptyHint') }}</p>
        <div class="space-y-3">
          <router-link to="/" class="ios-button bg-ios-blue text-white px-6 py-3 rounded-ios font-medium inline-block">
            {{ $t('favorites.browseStations') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div
      v-if="showClearDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="showClearDialog = false"
    >
      <div class="bg-white dark:bg-dark-card rounded-ios p-6 mx-4 max-w-sm w-full" @click.stop>
        <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-2">{{ $t('favorites.clearConfirmTitle') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mb-6">{{ $t('favorites.clearConfirmMessage') }}</p>
        <div class="flex gap-3">
          <button @click="showClearDialog = false" class="flex-1 ios-button bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text py-3 rounded-ios font-medium">
            {{ $t('favorites.cancel') }}
          </button>
          <button @click="handleClearAllFavorites" class="flex-1 ios-button bg-ios-red text-white py-3 rounded-ios font-medium">
            {{ $t('favorites.clear') }}
          </button>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import type { RadioStation } from '@/types/radio'

import { HeartIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ShareModal from '@/components/ShareModal.vue'

const favoritesStore = useFavoritesStore()
const playerStore = usePlayerStore()
const toastStore = useToastStore()

const showClearDialog = ref(false)
const isShareModalVisible = ref(false)
const stationToShare = ref<RadioStation | null>(null)

const favoriteStations = computed(() => favoritesStore.getFavoriteStations())

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

// 使用 favoritesStore 的方法
const handleRemoveFavorite = (station: RadioStation) => {
  favoritesStore.removeFavorite(station.stationuuid)
  toastStore.showSuccess('已移除收藏')
}

const handleClearAllFavorites = () => {
  favoritesStore.clearFavorites()
  showClearDialog.value = false
  toastStore.showSuccess('已清空所有收藏')
}

const openShareModal = (station: RadioStation) => {
  stationToShare.value = station
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
  stationToShare.value = null
}

onMounted(() => {
  favoritesStore.loadFavorites()
})
</script>
