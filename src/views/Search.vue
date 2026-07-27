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
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray" />
        <input
          v-model="searchQuery"
          @input="onSearch"
          :placeholder="$t('search.placeholder')"
          class="w-full pl-10 pr-4 py-3 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-ios-blue"
        />
      </div>

      <!-- 筛选条件 -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <select v-model="selectedCountry" @change="onSearch" class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text">
          <option value="">{{ $t('search.allCountries') }}</option>
          <option v-for="country in countries" :key="country.iso_3166_1" :value="country.iso_3166_1">
            {{ country.name }}
          </option>
        </select>
        <select v-model="selectedLanguage" @change="onSearch" class="px-3 py-2 rounded-ios border border-gray-200 dark:border-dark-gray bg-white dark:bg-dark-card text-ios-dark-gray dark:text-dark-text">
          <option value="">{{ $t('search.allLanguages') }}</option>
          <option v-for="lang in languages" :key="lang.iso_639" :value="lang.name">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <!-- 结果 -->
      <div v-if="radioStore.isLoading" class="text-center py-8">
        <div class="inline-block w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">{{ $t('common.loading') }}</p>
      </div>

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

    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRadioStore } from '@/stores/radio'
import BackButton from '@/components/common/BackButton.vue'
import StationCard from '@/components/common/StationCard.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const radioStore = useRadioStore()
const searchQuery = ref('')
const selectedCountry = ref('')
const selectedLanguage = ref('')

const countries = ref<any[]>([])
const languages = ref<any[]>([])

const onSearch = async () => {
  radioStore.searchQuery = searchQuery.value
  radioStore.selectedCountry = selectedCountry.value
  radioStore.selectedLanguage = selectedLanguage.value
  await radioStore.searchStations()
}

let debounceTimer: NodeJS.Timeout | null = null
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(onSearch, 500)
})

onMounted(async () => {
  await Promise.all([
    radioStore.loadCountries(),
    radioStore.loadLanguages()
  ])
  countries.value = radioStore.countries
  languages.value = radioStore.languages
})
</script>
