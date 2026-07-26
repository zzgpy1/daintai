<template>
  <div v-if="playerStore.currentStation" class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-t border-gray-200 dark:border-dark-gray px-4 py-3">
    <div class="max-w-6xl mx-auto flex items-center gap-4">
      <!-- 电台信息 -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <img
          v-if="playerStore.currentStation.favicon"
          :src="playerStore.currentStation.favicon"
          :alt="playerStore.currentStation.name"
          class="w-12 h-12 rounded-lg object-cover"
          @error="showFallback = true"
        />
        <div v-else class="w-12 h-12 rounded-lg bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          {{ playerStore.currentStation.name.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <h4 class="font-medium text-ios-dark-gray dark:text-dark-text truncate">{{ playerStore.currentStation.name }}</h4>
          <p class="text-sm text-ios-gray dark:text-dark-secondary truncate">{{ playerStore.currentStation.country }}</p>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="flex items-center gap-3">
        <!-- 收藏 -->
        <button @click="toggleFavorite" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
          <HeartIcon class="w-5 h-5" :class="playerStore.isFavorite ? 'text-ios-red fill-current' : 'text-ios-gray dark:text-dark-secondary'" />
        </button>

        <!-- 播放/暂停 -->
        <button @click="playerStore.togglePlayback" class="p-3 bg-ios-blue text-white rounded-full hover:bg-blue-600 transition-all active:scale-95">
          <PlayIcon v-if="!playerStore.isPlaying" class="w-5 h-5" />
          <PauseIcon v-else class="w-5 h-5" />
        </button>

        <!-- 关闭 -->
        <button @click="playerStore.stopStation" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
          <XMarkIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
        </button>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="max-w-6xl mx-auto mt-2">
      <input
        type="range"
        min="0"
        :max="playerStore.duration || 100"
        :value="playerStore.currentTime"
        @input="handleSeek"
        class="w-full h-1 bg-gray-200 dark:bg-dark-gray rounded-full appearance-none cursor-pointer accent-ios-blue"
      />
      <div class="flex justify-between text-xs text-ios-gray dark:text-dark-secondary mt-1">
        <span>{{ playerStore.formatTime(playerStore.currentTime) }}</span>
        <span>{{ playerStore.formatTime(playerStore.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { PlayIcon, PauseIcon, HeartIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const showFallback = ref(false)

const toggleFavorite = () => {
  if (playerStore.currentStation) {
    favoritesStore.toggleFavorite(playerStore.currentStation)
  }
}

const handleSeek = (e: Event) => {
  const target = e.target as HTMLInputElement
  playerStore.seek(parseFloat(target.value))
}
</script>
