<template>
  <div class="search-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 标题栏 -->
    <header class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <h1 class="text-lg sm:text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ t('search.title') }}</h1>
    </header>

    <div class="container-responsive py-4">
      <!-- 搜索框 -->
      <div class="relative mb-4">
        <MagnifyingGlassIcon class="absolute left-3 top-3 w-5 h-5 text-ios-gray" />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          :placeholder="t('search.placeholder')"
          class="w-full pl-10 pr-4 py-3 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-ios-blue"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray"
        >
          <XMarkIcon class="w-5 h-5 text-ios-gray" />
        </button>
      </div>

      <!-- 筛选条件 -->
      <div class="flex flex-wrap gap-2 mb-4">
        <select
          v-model="selectedCountry"
          @change="onFilterChange"
          class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-sm"
        >
          <option value="">{{ t('search.allCountries') }}</option>
          <option v-for="country in countries" :key="country.iso_3166_1" :value="country.iso_3166_1">
            {{ country.name }}
          </option>
        </select>

        <select
          v-model="selectedLanguage"
          @change="onFilterChange"
          class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-sm"
        >
          <option value="">{{ t('search.allLanguages') }}</option>
          <option v-for="lang in languages" :key="lang.name" :value="lang.name">
            {{ lang.name }}
          </option>
        </select>

        <button
          @click="resetFilters"
          class="px-3 py-2 rounded-ios bg-ios-light-gray dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text text-sm hover:bg-gray-200 dark:hover:bg-dark-light-gray"
        >
          {{ t('search.reset') }}
        </button>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="space-y-3">
        <div class="text-sm text-ios-gray dark:text-dark-secondary mb-2">
          {{ searchResults.length }} {{ t('search.stations') }}
        </div>
        <StationCard
          v-for="station in searchResults"
          :key="station.stationuuid"
          :station="station"
          @play="playStation"
          @favorite="toggleFavorite"
        />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!isLoading && searchQuery" class="text-center py-12">
        <div class="text-ios-gray dark:text-dark-secondary">
          <p class="text-lg">{{ t('search.noResults') }}</p>
          <p class="text-sm mt-2">{{ t('search.noResultsHint') }}</p>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="space-y-3">
        <StationSkeleton v-for="i in 4" :key="i" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useLanguageStore } from '@/stores/language'
import { debounce } from '@/utils/debounce'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'

const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const { t } = useLanguageStore()

const searchQuery = ref('')
const selectedCountry = ref('')
const selectedLanguage = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const countries = ref([])
const languages = ref([])

const performSearch = async () => {
  if (!searchQuery.value && !selectedCountry.value && !selectedLanguage.value) {
    searchResults.value = []
    return
  }

  isLoading.value = true
  try {
    const params: any = { limit: 50, hidebroken: true }
    if (searchQuery.value) params.name = searchQuery.value
    if (selectedCountry.value) params.countrycode = selectedCountry.value
    if (selectedLanguage.value) params.language = selectedLanguage.value
    
    const results = await radioStore.searchStations(params)
    searchResults.value = results
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = debounce(performSearch, 500)

const onSearchInput = () => {
  debouncedSearch()
}

const onFilterChange = () => {
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  performSearch()
}

const resetFilters = () => {
  selectedCountry.value = ''
  selectedLanguage.value = ''
  performSearch()
}

const playStation = (station: any) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: any) => {
  playerStore.toggleFavorite(station)
}

onMounted(async () => {
  await radioStore.loadCountries()
  countries.value = radioStore.countries
  languages.value = radioStore.languages
})
</script>
