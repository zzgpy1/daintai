<template>
  <div class="ios-card p-4 hover:shadow-lg transition-all cursor-pointer" @click="goToDetail">
    <div class="flex items-center gap-4">
      <!-- 图标 -->
      <img
        v-if="station.favicon"
        :src="station.favicon"
        :alt="station.name"
        class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        @error="showFallback = true"
      />
      <div v-else class="w-12 h-12 rounded-lg bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {{ station.name.charAt(0).toUpperCase() }}
      </div>

      <!-- 信息 -->
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-ios-dark-gray dark:text-dark-text truncate">{{ station.name }}</h3>
        <p class="text-sm text-ios-gray dark:text-dark-secondary truncate">{{ station.country }}</p>
        <div class="flex gap-1 mt-1">
          <span v-for="tag in tags.slice(0, 2)" :key="tag" class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-gray rounded-full text-ios-gray dark:text-dark-secondary">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 操作 -->
      <div class="flex items-center gap-2">
        <button @click.stop="toggleFavorite" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
          <HeartIcon class="w-5 h-5" :class="isFavorited ? 'text-ios-red fill-current' : 'text-ios-gray dark:text-dark-secondary'" />
        </button>
        <button @click.stop="handlePlay" class="p-2 bg-ios-blue text-white rounded-full hover:bg-blue-600 transition-colors">
          <PlayIcon v-if="!isCurrentPlaying" class="w-4 h-4" />
          <PauseIcon v-else class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import type { RadioStation } from '@/types/radio'
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ station: RadioStation }>()

const router = useRouter()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const showFallback = ref(false)

const tags = computed(() => {
  if (!props.station.tags) return []
  return props.station.tags.split(',').map(t => t.trim()).filter(Boolean)
})

const isFavorited = computed(() => favoritesStore.isFavorite(props.station.stationuuid))
const isCurrentPlaying = computed(() => 
  playerStore.currentStation?.stationuuid === props.station.stationuuid && playerStore.isPlaying
)

const goToDetail = () => {
  router.push(`/station/${props.station.stationuuid}`)
}

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.station)
}

const handlePlay = async () => {
  if (isCurrentPlaying.value) {
    playerStore.pauseStation()
  } else {
    await playerStore.playStation(props.station)
  }
}
</script>
