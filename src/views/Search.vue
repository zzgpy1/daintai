<template>
  <div class="search-page">
    <!-- 标题栏 -->
    <header class="sticky top-0 z-20 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="container-responsive">
        <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">
          {{ $t('search.title') }}
        </h1>
      </div>
    </header>

    <div class="container-responsive py-4 space-y-4">
      <!-- 搜索框 -->
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="w-full pl-10 pr-4 py-3 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 outline-none transition-all"
          @input="onSearchInput"
          @keyup.enter="searchStations"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray"
        >
          <XMarkIcon class="w-4 h-4 text-ios-gray" />
        </button>
      </div>

      <!-- 筛选条件 -->
      <div class="flex flex-wrap gap-2">
        <select
          v-model="selectedCountry"
          class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text text-sm focus:border-ios-blue outline-none"
          @change="searchStations"
        >
          <option value="">{{ $t('search.allCountries') }}</option>
          <option v-for="country in radioStore.countries" :key="country.iso_3166_1" :value="country.iso_3166_1">
            {{ country.name }}
          </option>
        </select>

        <select
          v-model="selectedLanguage"
          class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text text-sm focus:border-ios-blue outline-none"
          @change="searchStations"
        >
          <option value="">{{ $t('search.allLanguages') }}</option>
          <option v-for="lang in radioStore.languages.slice(0, 50)" :key="lang.iso_639" :value="lang.name">
            {{ lang.name }}
          </option>
        </select>

        <button
          @click="resetFilters"
          class="px-3 py-2 rounded-ios text-sm text-ios-gray hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
        >
          {{ $t('search.reset') }}
        </button>
      </div>

      <!-- 结果统计 -->
      <div v-if="radioStore.stations.length > 0" class="text-sm text-ios-gray dark:text-dark-secondary">
        {{ radioStore.totalStations }} {{ $t('search.stations') }}
      </div>

      <!-- 搜索结果 -->
      <div v-if="radioStore.isLoading" class="space-y-3">
        <StationSkeleton v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="radioStore.stations.length > 0" class="space-y-3">
        <StationCard
          v-for="station in radioStore.filteredStations"
          :key="station.stationuuid"
          :station="station"
          @play="playStation"
          @favorite="toggleFavorite"
          @share="openShareModal"
        />
        
        <!-- 加载更多 -->
        <div v-if="radioStore.hasMore" class="text-center py-4">
          <button
            @click="loadMore"
            :disabled="radioStore.isLoadingMore"
            class="text-ios-blue hover:underline disabled:opacity-50"
          >
            {{ radioStore.isLoadingMore ? $t('common.loading') : $t('search.loadMore') }}
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!radioStore.isLoading && searched" class="text-center py-12">
        <div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-dark-gray rounded-full flex items-center justify-center mb-4">
          <MagnifyingGlassIcon class="w-8 h-8 text-ios-gray" />
        </div>
        <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text mb-2">
          {{ $t('search.noResults') }}
        </h3>
        <p class="text-ios-gray dark:text-dark-secondary">
          {{ $t('search.noResultsHint') }}
        </p>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <ShareModal 
      :visible="isShareModalVisible" 
      :station="shareStation" 
      @close="closeShareModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useRadioStore } from '@/stores/radio'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import { debounce } from '@/utils/debounce'
import type { RadioStation } from '@/types/radio'

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'
import ShareModal from '@/components/ShareModal.vue'

const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const selectedCountry = ref('')
const selectedLanguage = ref('')
const searched = ref(false)
const isShareModalVisible = ref(false)
const shareStation = ref<RadioStation | null>(null)

const playStation = async (station: RadioStation) => {
  try {
    await playerStore.playStation(station)
  } catch (error) {
    toastStore.showError('播放失败，请稍后重试')
  }
}

const toggleFavorite = (station: RadioStation) => {
  favoritesStore.toggleFavorite(station)
}

const searchStations = async () => {
  if (!searchQuery.value && !selectedCountry.value && !selectedLanguage.value) {
    radioStore.stations = []
    searched.value = false
    return
  }
  
  searched.value = true
  radioStore.currentPage = 1
  await radioStore.searchStations({
    name: searchQuery.value || undefined,
    countrycode: selectedCountry.value || undefined,
    language: selectedLanguage.value || undefined
  })
}

const onSearchInput = debounce(searchStations, 500)

const loadMore = async () => {
  await radioStore.loadMore()
}

const clearSearch = () => {
  searchQuery.value = ''
  radioStore.stations = []
  searched.value = false
}

const resetFilters = () => {
  selectedCountry.value = ''
  selectedLanguage.value = ''
  searchStations()
}

const openShareModal = (station: RadioStation) => {
  shareStation.value = station
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
  shareStation.value = null
}

onMounted(() => {
  radioStore.loadCountries()
  radioStore.loadLanguages()
})
</script>
