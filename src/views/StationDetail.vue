<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-24">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="inline-block w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <div v-else-if="station" class="max-w-4xl mx-auto px-4 py-6">
      <!-- 返回按钮 + 标题 -->
      <div class="flex items-center gap-4 mb-4">
        <BackButton />
      </div>

      <div class="ios-card p-6 text-center">
        <div class="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-lg mb-4">
          <img
            v-if="station.favicon"
            :src="station.favicon"
            :alt="station.name"
            class="w-full h-full object-cover"
            @error="showFallback = true"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
            {{ station.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ station.name }}</h1>
        <p class="text-ios-gray dark:text-dark-secondary">{{ station.country }}</p>
        <p v-if="station.state" class="text-sm text-ios-gray dark:text-dark-secondary">{{ station.state }}</p>

        <div class="flex flex-wrap justify-center gap-2 mt-4">
          <span v-for="tag in tags" :key="tag" class="px-3 py-1 bg-gray-100 dark:bg-dark-gray rounded-full text-sm text-ios-gray dark:text-dark-secondary">
            {{ tag }}
          </span>
        </div>

        <div class="flex justify-center gap-4 mt-6">
          <button @click="handlePlay" class="flex items-center gap-2 px-6 py-3 bg-ios-blue text-white rounded-ios hover:bg-blue-600 transition-colors">
            <PlayIcon v-if="!isCurrentPlaying" class="w-5 h-5" />
            <PauseIcon v-else class="w-5 h-5" />
            {{ isCurrentPlaying ? $t('player.pause') : $t('player.play') }}
          </button>

          <button @click="toggleFavorite" class="flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-dark-gray rounded-ios hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors">
            <HeartIcon class="w-5 h-5" :class="isFavorited ? 'text-ios-red fill-current' : 'text-ios-gray dark:text-dark-secondary'" />
            {{ isFavorited ? $t('player.favorited') : $t('player.favorite') }}
          </button>
        </div>
      </div>

      <div class="ios-card p-4 mt-4">
        <h3 class="font-medium text-ios-dark-gray dark:text-dark-text mb-2">技术信息</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span class="text-ios-gray dark:text-dark-secondary">编码格式:</span>
          <span class="text-ios-dark-gray dark:text-dark-text">{{ station.codec || '未知' }}</span>
          <span class="text-ios-gray dark:text-dark-secondary">比特率:</span>
          <span class="text-ios-dark-gray dark:text-dark-text">{{ station.bitrate ? `${station.bitrate} kbps` : '未知' }}</span>
          <span class="text-ios-gray dark:text-dark-secondary">语言:</span>
          <span class="text-ios-dark-gray dark:text-dark-text">{{ station.language || '未知' }}</span>
          <span class="text-ios-gray dark:text-dark-secondary">投票:</span>
          <span class="text-ios-dark-gray dark:text-dark-text">{{ station.votes || 0 }}</span>
        </div>
      </div>
    </div>

    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import type { RadioStation } from '@/types/radio'
import BackButton from '@/components/common/BackButton.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const station = ref<RadioStation | null>(null)
const loading = ref(true)
const showFallback = ref(false)

const tags = computed(() => {
  if (!station.value?.tags) return []
  return station.value.tags.split(',').map(t => t.trim()).filter(Boolean)
})

const isFavorited = computed(() => {
  if (!station.value) return false
  return favoritesStore.isFavorite(station.value.stationuuid)
})

const isCurrentPlaying = computed(() => {
  return playerStore.currentStation?.stationuuid === station.value?.stationuuid && playerStore.isPlaying
})

const handlePlay = async () => {
  if (!station.value) return
  if (isCurrentPlaying.value) {
    playerStore.pauseStation()
  } else {
    await playerStore.playStation(station.value)
  }
}

const toggleFavorite = () => {
  if (!station.value) return
  favoritesStore.toggleFavorite(station.value)
  toastStore.showInfo(isFavorited.value ? '已取消收藏' : '已添加到收藏')
}

onMounted(async () => {
  const uuid = route.params.uuid as string
  try {
    const result = await radioStore.getStationByUUID(uuid)
    if (result) {
      station.value = result
      document.title = `${result.name} - 全球电台`
    }
  } catch (error) {
    toastStore.showError('加载电台详情失败')
  } finally {
    loading.value = false
  }
})
</script>
