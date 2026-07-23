<template>
  <div class="station-detail-page min-h-screen bg-white dark:bg-black">
    <div v-if="isLoading" class="flex justify-center items-center h-96">
      <div class="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="station" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white/95 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
        <div class="relative h-64 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30">
          <div class="relative z-10 flex flex-col items-center">
            <img v-if="station.favicon" :src="station.favicon" :alt="station.name" class="w-32 h-32 rounded-full shadow-2xl" />
            <h1 class="text-2xl font-bold text-white mt-4">{{ station.name }}</h1>
            <p class="text-white/80">{{ station.country }}</p>
          </div>
        </div>

        <div class="p-6">
          <div class="flex justify-center gap-4">
            <button @click="playStation" class="flex items-center gap-2 px-8 py-3 bg-ios-blue text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              <span>{{ isPlaying ? t('player.pause') : t('player.play') }}</span>
            </button>
            <button @click="toggleFavorite" class="px-6 py-3 rounded-xl transition-all" :class="isFavorite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'">
              <span>{{ isFavorite ? t('player.favorited') : t('player.addToFavorite') }}</span>
            </button>
          </div>

          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <span v-for="tag in formattedTags" :key="tag" class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300 text-sm rounded-full">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useRadioStore } from '@/stores/radio'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'

const route = useRoute()
const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const station = ref<RadioStation | null>(null)
const isLoading = ref(true)

const isPlaying = computed(() => playerStore.isPlaying)
const isFavorite = computed(() => station.value ? playerStore.isStationFavorite(station.value.stationuuid) : false)

const formattedTags = computed(() => {
  if (!station.value?.tags) return []
  return station.value.tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 5)
})

const playStation = () => {
  if (station.value) {
    playerStore.playStation(station.value)
  }
}

const toggleFavorite = () => {
  if (station.value) {
    playerStore.toggleFavorite(station.value)
  }
}

onMounted(async () => {
  const uuid = route.params.uuid as string
  const result = await radioStore.getStationByUuid(uuid)
  if (result) {
    station.value = result
    document.title = `${result.name} | 全球电台`
  }
  isLoading.value = false
})
</script>
