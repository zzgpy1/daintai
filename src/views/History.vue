<template>
  <div class="history-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 标题栏 -->
    <div class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between min-h-[44px]">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-ios-dark-gray dark:text-dark-text leading-tight max-w-[65%] break-words">
          {{ $t('nav.history') }}
        </h1>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            v-if="historyStore.count > 0"
            @click="showClearConfirm = true"
            class="text-ios-red text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-ios transition-colors"
          >
            {{ $t('history.clearAll') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 历史列表 -->
    <div v-if="historyStore.count > 0" class="container-responsive p-4">
      <div v-for="[date, items] in groupedHistory" :key="date" class="mb-6">
        <div class="px-4 py-2 sticky top-16 mobile:top-[61px] bg-ios-light-gray/80 dark:bg-dark-bg/80 backdrop-blur-sm">
          <h2 class="text-sm font-semibold text-ios-gray dark:text-dark-secondary uppercase tracking-wide">
            {{ formatDate(date) }}
          </h2>
        </div>

        <div class="space-y-3 mt-2">
          <StationCard
            v-for="item in items"
            :key="item.timestamp"
            :station="item.station"
            :history-timestamp="item.timestamp"
            variant="history"
            @play="playStation"
            @favorite="toggleFavorite"
            @remove="removeFromHistory"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div class="text-center">
        <ClockIcon class="w-16 h-16 text-ios-light-gray dark:text-dark-secondary mx-auto mb-4" />
        <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text mb-2">{{ $t('history.empty') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mb-6">{{ $t('history.emptyHint') }}</p>
        <router-link to="/" class="ios-button bg-ios-blue text-white px-6 py-3 rounded-ios font-medium inline-block">
          {{ $t('history.exploreStations') }}
        </router-link>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="showClearConfirm = false"
    >
      <div class="bg-white dark:bg-dark-card rounded-ios p-6 mx-4 max-w-sm w-full" @click.stop>
        <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-2">{{ $t('history.clearConfirmTitle') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mb-6">{{ $t('history.clearConfirmMessage') }}</p>
        <div class="flex gap-3">
          <button @click="showClearConfirm = false" class="flex-1 ios-button bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text py-3 rounded-ios font-medium">
            {{ $t('common.cancel') }}
          </button>
          <button @click="confirmClearHistory" class="flex-1 ios-button bg-ios-red text-white py-3 rounded-ios font-medium">
            {{ $t('history.clearAll') }}
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
import { useHistoryStore } from '@/stores/history'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'

import { ClockIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ShareModal from '@/components/ShareModal.vue'

const historyStore = useHistoryStore()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const languageStore = useLanguageStore()

const showClearConfirm = ref(false)
const isShareModalVisible = ref(false)
const stationToShare = ref<RadioStation | null>(null)

const groupedHistory = computed(() => {
  const groups = new Map<string, typeof historyStore.history.value[0][]>()
  for (const item of historyStore.history) {
    const date = new Date(item.timestamp).toDateString()
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date)!.push(item)
  }
  return Array.from(groups.entries())
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return languageStore.t('history.today')
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return languageStore.t('history.yesterday')
  }
  return date.toLocaleDateString(languageStore.currentLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const playStation = async (station: RadioStation) => {
  await playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  favoritesStore.toggleFavorite(station)
}

const removeFromHistory = (timestamp: number) => {
  historyStore.removeFromHistory(timestamp)
}

const confirmClearHistory = () => {
  historyStore.clearHistory()
  showClearConfirm.value = false
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
  historyStore.loadHistory()
})
</script>
