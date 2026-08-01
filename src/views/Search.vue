<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-24">
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-gray px-4 py-4">
      <div class="max-w-6xl mx-auto flex items-center gap-4">
        <BackButton />
        <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('search.title') }}</h1>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- 搜索框 -->
      <div class="relative mb-4">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray pointer-events-none" />
        <input
          v-model="searchQuery"
          @input="onSearch"
          :placeholder="$t('search.placeholder')"
          class="w-full pl-10 pr-4 py-3 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-ios-blue"
          autofocus
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="isSearching" class="text-center py-8">
        <div class="inline-block w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">{{ $t('common.loading') }}</p>
      </div>

      <!-- 结果 -->
      <div v-else-if="radioStore.filteredStations.length === 0 && searchQuery" class="text-center py-8">
        <p class="text-ios-gray dark:text-dark-secondary">{{ $t('search.noResults') }}</p>
      </div>

      <div v-else class="space-y-3">
        <div class="text-sm text-ios-gray dark:text-dark-secondary mb-2">
          {{ radioStore.filteredStations.length }} {{ $t('search.results') }}
        </div>
        <StationCard v-for="station in radioStore.filteredStations" :key="station.stationuuid" :station="station" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRadioStore } from '@/stores/radio'
import { useToastStore } from '@/stores/toast'
import BackButton from '@/components/common/BackButton.vue'
import StationCard from '@/components/common/StationCard.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const radioStore = useRadioStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const isSearching = ref(false)

let abortController: AbortController | null = null

const onSearch = async () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  
  if (!searchQuery.value.trim()) {
    radioStore.stations = []
    return
  }

  isSearching.value = true
  abortController = new AbortController()
  radioStore.searchQuery = searchQuery.value
  radioStore.selectedCountry = 'CN'
  radioStore.selectedLanguage = ''

  try {
    await radioStore.searchStations(undefined, abortController.signal)
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.log('搜索已取消')
    } else {
      console.error('搜索失败', err)
      toastStore.showError('搜索失败，请重试')
    }
  } finally {
    isSearching.value = false
    abortController = null
  }
}

let debounceTimer: NodeJS.Timeout | null = null
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(onSearch, 500)
})

onBeforeUnmount(() => {
  if (abortController) abortController.abort()
})
</script>
