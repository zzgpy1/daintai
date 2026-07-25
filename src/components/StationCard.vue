<template>
  <div class="station-grid-card ios-card p-4 hover:shadow-ios-lg dark:hover:shadow-dark-ios-lg transition-all">
    <router-link :to="`/station/${station.stationuuid}`" class="block text-center">
      <div class="mb-3">
        <div ref="containerRef" class="station-name-container overflow-hidden text-center">
          <h3 ref="stationNameRef" class="station-name font-medium text-ios-dark-gray dark:text-white whitespace-nowrap">
            {{ station.name }}
          </h3>
        </div>
      </div>
      
      <div class="text-center">
        <div class="relative mx-auto mb-3 w-16 h-16">
          <img
            v-if="station.favicon && !showFallback"
            :src="station.favicon"
            :alt="station.name"
            class="w-full h-full rounded-ios object-cover"
            loading="lazy"
            @error="showFallback = true"
          />
          <div v-else class="w-full h-full rounded-ios bg-gradient-to-br from-ios-blue to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {{ getInitial(station.name) }}
          </div>
          
          <div
            v-if="isCurrentStation && playerStore.isPlaying"
            class="absolute -bottom-1 -right-1 w-5 h-5 bg-ios-blue rounded-full flex items-center justify-center"
          >
            <div class="w-2.5 h-2.5 bg-white rounded-full playing-animation"></div>
          </div>
        </div>
        
        <div class="mb-4">
          <p class="text-sm text-ios-gray dark:text-dark-secondary truncate">{{ station.country }}</p>
        </div>
      </div>
    </router-link>
    
    <div class="flex justify-center gap-2">
      <button
        @click="toggleFavorite"
        class="p-2 rounded-full transition-all active:scale-95"
        :class="[
          isFavorited
            ? 'text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-ios-gray dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-gray'
        ]"
      >
        <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
      </button>
      
      <button
        @click="handlePlay"
        :disabled="isLoading"
        class="p-3 rounded-full transition-all active:scale-95"
        :class="[
          isCurrentStation && playerStore.isPlaying
            ? 'bg-ios-blue text-white'
            : 'bg-ios-light-gray dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-light-gray'
        ]"
      >
        <component :is="playButtonIcon" class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
      </button>
      
      <button
        @click="shareStation"
        class="p-2 rounded-full transition-all active:scale-95 text-ios-gray dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-gray"
      >
        <ShareIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import type { RadioStation } from '@/types/radio'

import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  ArrowPathIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'

interface Props {
  station: RadioStation
}

interface Emits {
  play: [station: RadioStation]
  favorite: [station: RadioStation]
  share: [station: RadioStation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()

const showFallback = ref(false)
const stationNameRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const isCurrentStation = computed(() => 
  playerStore.currentStation?.stationuuid === props.station.stationuuid
)
const isLoading = computed(() => isCurrentStation.value && playerStore.isLoading)
const isFavorited = computed(() => favoritesStore.isFavorite(props.station.stationuuid))

const playButtonIcon = computed(() => {
  if (isLoading.value) return ArrowPathIcon
  if (isCurrentStation.value && playerStore.isPlaying) return PauseIcon
  return PlayIcon
})

const getInitial = (name: string): string => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const handlePlay = () => {
  if (isCurrentStation.value && playerStore.isPlaying) {
    playerStore.pauseStation()
  } else {
    emit('play', props.station)
  }
}

const toggleFavorite = () => {
  emit('favorite', props.station)
}

const shareStation = () => {
  emit('share', props.station)
}

// 检查文字溢出
const checkTextOverflow = async () => {
  await nextTick()
  if (containerRef.value && stationNameRef.value) {
    const containerWidth = containerRef.value.clientWidth
    const textWidth = stationNameRef.value.scrollWidth
    if (textWidth > containerWidth) {
      stationNameRef.value.classList.add('animate-scroll')
    } else {
      stationNameRef.value.classList.remove('animate-scroll')
    }
  }
}

onMounted(() => {
  checkTextOverflow()
})
</script>

<style scoped>
.station-name-container {
  position: relative;
  width: 100%;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.station-name {
  display: inline-block;
  min-width: max-content;
  transition: transform 0.3s ease;
}

.station-name.animate-scroll {
  animation: scrollTextGrid 10s linear infinite;
}

@keyframes scrollTextGrid {
  0% { transform: translateX(0); }
  25% { transform: translateX(0); }
  75% { transform: translateX(calc(-100% + 12rem)); }
  100% { transform: translateX(calc(-100% + 12rem)); }
}

.playing-animation {
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0.4; transform: scale(0.8); }
}
</style>
