<template>
  <div class="station-detail-page min-h-screen bg-white dark:bg-black">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center h-96">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-20">
      <div class="max-w-md mx-auto px-6">
        <ExclamationTriangleIcon class="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ t('common.error') }}</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">{{ error }}</p>
        <button @click="$router.push('/')" class="ios-button-primary">
          {{ t('common.back') }}
        </button>
      </div>
    </div>

    <!-- 电台详情 -->
    <div v-else-if="station" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white/95 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
        <!-- 封面区域 -->
        <div class="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center">
          <div class="relative group">
            <div class="w-32 h-32 rounded-full bg-gray-800/80 flex items-center justify-center">
              <div class="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center">
                <img
                  v-if="station.favicon && !faviconError"
                  :src="station.favicon"
                  @error="faviconError = true"
                  class="w-20 h-20 object-cover rounded-full"
                />
                <img v-else :src="generatedIconUrl" class="w-20 h-20 object-cover rounded-full" />
              </div>
            </div>
          </div>

          <div class="text-center mt-4">
            <h1 class="text-2xl font-bold text-white">{{ station.name }}</h1>
            <p class="text-white/80">{{ station.country }}</p>
          </div>
        </div>

        <!-- 信息区域 -->
        <div class="p-6">
          <!-- 标签 -->
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            <span
              v-for="tag in formattedTags"
              :key="tag"
              class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 播放控制 -->
          <div class="flex justify-center gap-4 mb-6">
            <button
              @click="playStation"
              class="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-ios-blue to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <component :is="playButtonIcon" class="w-6 h-6" />
              <span>{{ isCurrentAndPlaying ? t('player.pause') : t('player.play') }}</span>
            </button>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center gap-6">
            <button
              @click="toggleFavorite"
              class="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50"
              :class="isFavorite ? 'text-red-500' : 'text-gray-500'"
            >
              <HeartIcon class="w-6 h-6" :class="{ 'fill-current': isFavorite }" />
              <span class="text-xs">{{ isFavorite ? t('player.favorited') : t('player.favorite') }}</span>
            </button>

            <button
              @click="openShareModal"
              class="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500"
            >
              <ShareIcon class="w-6 h-6" />
              <span class="text-xs">{{ t('player.share') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ShareModal :visible="isShareModalVisible" :station="station" @close="isShareModalVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { ExclamationTriangleIcon, HeartIcon, PlayIcon, PauseIcon, ShareIcon } from '@heroicons/vue/24/outline'
import ShareModal from '@/components/ShareModal.vue'

const route = useRoute()
const router = useRouter()
const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const { t } = useLanguageStore()

const station = ref<RadioStation | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isShareModalVisible = ref(false)
const faviconError = ref(false)

const stationUuid = computed(() => route.params.uuid as string)

const isCurrentAndPlaying = computed(() => {
  return playerStore.currentStation?.stationuuid === station.value?.stationuuid && playerStore.isPlaying
})

const playButtonIcon = computed(() => {
  return isCurrentAndPlaying.value ? PauseIcon : PlayIcon
})

const isFavorite = computed(() => {
  if (!station.value) return false
  return playerStore.isStationFavorite(station.value.stationuuid)
})

const formattedTags = computed(() => {
  if (!station.value?.tags) return []
  return station.value.tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 5)
})

const generatedIconUrl = computed(() => {
  return station.value ? generateIconDataUrl(station.value.name) : ''
})

const playStation = () => {
  if (!station.value) return
  if (isCurrentAndPlaying.value) {
    playerStore.pauseStation()
  } else {
    playerStore.playStation(station.value)
  }
}

const toggleFavorite = () => {
  if (!station.value) return
  playerStore.toggleFavorite(station.value)
}

const openShareModal = () => {
  isShareModalVisible.value = true
}

onMounted(async () => {
  try {
    const result = await radioStore.getStationByUuid(stationUuid.value)
    if (result) {
      station.value = result
      document.title = `${result.name} | 全球电台`
    } else {
      error.value = '未找到该电台'
    }
  } catch (e: any) {
    error.value = e.message || '加载失败'
  } finally {
    isLoading.value = false
  }
})
</script>
