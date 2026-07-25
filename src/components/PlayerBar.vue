<template>
  <div v-if="playerStore.currentStation" class="player-bar fixed bottom-0 md:bottom-0 left-0 right-0 z-20 glass-effect border-t border-gray-200/60 dark:border-dark-gray px-4 py-3 md:py-2">
    <div class="max-w-6xl mx-auto flex items-center gap-3 md:gap-4">
      <!-- 电台信息 -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="flex-shrink-0 relative">
          <img
            v-if="playerStore.currentStation?.favicon"
            :src="playerStore.currentStation.favicon"
            :alt="playerStore.currentStation.name"
            class="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
            @error="showFallback = true"
            v-show="!showFallback"
          />
          <div v-else class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-ios-blue to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {{ playerStore.currentStation?.name?.charAt(0) || '?' }}
          </div>
          <div v-if="playerStore.isPlaying" class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-ios-dark-gray dark:text-dark-text truncate text-sm md:text-base">
            {{ playerStore.currentStation?.name }}
          </h4>
          <p class="text-xs text-ios-gray dark:text-dark-secondary truncate">
            {{ playerStore.currentStation?.country }}
          </p>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="flex items-center gap-1 md:gap-3">
        <!-- 收藏 -->
        <button
          @click="toggleFavorite"
          class="p-2 rounded-full transition-all active:scale-95 hover:bg-gray-100 dark:hover:bg-dark-gray"
          :class="isFavorited ? 'text-ios-red' : 'text-ios-gray dark:text-dark-secondary'"
        >
          <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
        </button>
        
        <!-- 播放/暂停 -->
        <button
          @click="togglePlayback"
          :disabled="playerStore.isLoading"
          class="p-3 bg-ios-blue text-white rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
        >
          <component :is="playButtonIcon" class="w-5 h-5" :class="{ 'animate-spin': playerStore.isLoading }" />
        </button>
        
        <!-- 音量 (桌面) -->
        <div class="hidden md:flex items-center gap-2">
          <button @click="toggleMute" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
            <component :is="volumeIcon" class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="playerStore.volume"
            @input="setVolume"
            class="w-20 h-1.5 bg-gray-200 dark:bg-dark-gray rounded-full appearance-none cursor-pointer accent-ios-blue"
          />
        </div>
        
        <!-- 关闭 -->
        <button @click="closePlayer" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
          <XMarkIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'

import { PlayIcon, PauseIcon, HeartIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const showFallback = ref(false)

const isFavorited = computed(() => {
  if (!playerStore.currentStation) return false
  return favoritesStore.isFavorite(playerStore.currentStation.stationuuid)
})

const playButtonIcon = computed(() => {
  if (playerStore.isLoading) return ArrowPathIcon
  return playerStore.isPlaying ? PauseIcon : PlayIcon
})

const volumeIcon = computed(() => {
  return playerStore.isMuted || playerStore.volume === 0 ? SpeakerXMarkIcon : SpeakerWaveIcon
})

const togglePlayback = () => {
  if (playerStore.isPlaying) {
    playerStore.pauseStation()
  } else {
    playerStore.resumeStation()
  }
}

const toggleFavorite = () => {
  if (playerStore.currentStation) {
    favoritesStore.toggleFavorite(playerStore.currentStation)
  }
}

const toggleMute = () => {
  playerStore.toggleMute()
}

const setVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  playerStore.setVolume(parseFloat(target.value))
}

const closePlayer = () => {
  playerStore.stopStation()
}
</script>

<style scoped>
.player-bar {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.85);
}

.dark .player-bar {
  background: rgba(28, 28, 30, 0.85);
}
</style>
