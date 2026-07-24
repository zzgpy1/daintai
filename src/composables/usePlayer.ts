import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { RadioStation } from '@/types/radio'

export function usePlayer() {
  const playerStore = usePlayerStore()

  const isCurrentStation = (station: RadioStation) => {
    return playerStore.currentStation?.stationuuid === station.stationuuid
  }

  const isPlaying = computed(() => playerStore.isPlaying)
  const isLoading = computed(() => playerStore.isLoading)
  const currentStation = computed(() => playerStore.currentStation)
  const isFavorite = (station: RadioStation) => {
    return playerStore.isStationFavorite(station.stationuuid)
  }

  const togglePlay = (station: RadioStation) => {
    if (isCurrentStation(station) && playerStore.isPlaying) {
      playerStore.pauseStation()
    } else {
      playerStore.playStation(station)
    }
  }

  const toggleFavorite = (station: RadioStation) => {
    playerStore.toggleFavorite(station)
  }

  return {
    isCurrentStation,
    isPlaying,
    isLoading,
    currentStation,
    isFavorite,
    togglePlay,
    toggleFavorite
  }
}
