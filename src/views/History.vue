<template>
  <div class="history-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <div class="container-responsive py-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('history.title') }}</h1>
        <button v-if="historyItems.length > 0" @click="clearHistory" class="text-ios-red text-sm font-medium">
          {{ t('history.clearAll') }}
        </button>
      </div>

      <div v-if="historyItems.length > 0" class="space-y-3">
        <StationCard
          v-for="item in historyItems"
          :key="item.timestamp"
          :station="item.station"
          variant="history"
          @play="playStation"
          @favorite="toggleFavorite"
        />
      </div>
      <div v-else class="text-center py-12">
        <p class="text-ios-gray dark:text-dark-secondary">{{ t('history.empty') }}</p>
        <p class="text-sm text-ios-gray dark:text-dark-secondary mt-2">{{ t('history.emptyHint') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useHistoryStore } from '@/stores/history'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation, HistoryItem } from '@/types/radio'
import StationCard from '@/components/StationCard.vue'

const playerStore = usePlayerStore()
const historyStore = useHistoryStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const historyItems = ref<HistoryItem[]>([])

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  playerStore.toggleFavorite(station)
}

const clearHistory = () => {
  historyStore.clearHistory()
  historyItems.value = []
}

onMounted(() => {
  historyStore.loadHistory()
  historyItems.value = historyStore.history
})
</script>
