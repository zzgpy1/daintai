<template>
  <div class="search-page min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-20">
    <!-- 标题栏 -->
    <div class="sticky top-0 z-10 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          @click="$router.push('/')"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
        </button>
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ios-gray dark:text-dark-secondary" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('search.placeholder')"
            class="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-dark-gray rounded-ios text-ios-dark-gray dark:text-dark-text placeholder:text-ios-gray dark:placeholder:text-dark-secondary focus:outline-none focus:ring-2 focus:ring-ios-blue"
            @input="onSearch"
            @keyup.enter="performSearch"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-light-gray transition-colors"
          >
            <XMarkIcon class="w-4 h-4 text-ios-gray dark:text-dark-secondary" />
          </button>
        </div>
        <button
          @click="performSearch"
          class="px-4 py-2 bg-ios-blue text-white rounded-ios font-medium hover:bg-blue-600 transition-colors"
        >
          {{ $t('search.searchButton') }}
        </button>
      </div>
    </div>

    <!-- 快速筛选 -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-dark-gray bg-white/50 dark:bg-dark-surface/50">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          @click="applyFilter(filter.key)"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="[
            activeFilter === filter.key
              ? 'bg-ios-blue text-white'
              : 'bg-gray-100 dark:bg-dark-gray text-ios-gray dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-dark-light-gray'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-dark-gray bg-white/50 dark:bg-dark-surface/50">
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="selectedCountry"
          class="px-3 py-1.5 bg-gray-100 dark:bg-dark-gray rounded-ios text-sm text-ios-dark-gray dark:text-dark-text border-none focus:ring-2 focus:ring-ios-blue"
        >
          <option value="">{{ $t('search.allCountries') }}</option>
          <option v-for="country in countries" :key="country.iso_3166_1" :value="country.iso_3166_1">
            {{ country.name }}
          </option>
        </select>
        
        <select
          v-model="selectedLanguage"
          class="px-3 py-1.5 bg-gray-100 dark:bg-dark-gray rounded-ios text-sm text-ios-dark-gray dark:text-dark-text border-none focus:ring-2 focus:ring-ios-blue"
        >
          <option value="">{{ $t('search.allLanguages') }}</option>
          <option v-for="lang in languages" :key="lang.iso_639" :value="lang.iso_639">
            {{ lang.name }}
          </option>
        </select>
        
        <button
          @click="resetFilters"
          class="px-3 py-1.5 text-sm text-ios-gray dark:text-dark-secondary hover:text-ios-dark-gray dark:hover:text-dark-text transition-colors"
        >
          {{ $t('search.reset') }}
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="container-responsive p-4">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="space-y-3">
        <StationSkeleton v-for="i in 5" :key="i" />
      </div>
      
      <!-- 结果列表 -->
      <div v-else-if="filteredStations.length > 0" class="space-y-3">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-ios-gray dark:text-dark-secondary">
            {{ $t('search.results') }}: {{ filteredStations.length }} {{ $t('search.stations') }}
          </span>
        </div>
        
        <StationCard
          v-for="station in filteredStations"
          :key="station.stationuuid"
          :station="station"
          @play="playStation"
          @favorite="toggleFavorite"
          @share="openShareModal"
        />
        
        <!-- 加载更多 -->
        <div v-if="hasMore" class="text-center py-4">
          <button
            @click="loadMore"
            :disabled="isLoadingMore"
            class="px-6 py-2 bg-gray-100 dark:bg-dark-gray rounded-ios text-ios-dark-gray dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-light-gray transition-colors disabled:opacity-50"
          >
            {{ isLoadingMore ? $t('common.loading') : $t('common.loadMore') }}
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="searched && !isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-dark-gray rounded-full flex items-center justify-center">
            <MagnifyingGlassIcon class="w-10 h-10 text-ios-gray dark:text-dark-secondary" />
          </div>
          <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text mb-2">
            {{ $t('search.noResults') }}
          </h3>
          <p class="text-ios-gray dark:text-dark-secondary">
            {{ $t('search.noResultsHint') }}
          </p>
        </div>
      </div>
      
      <!-- 初始状态 -->
      <div v-else class="space-y-6">
        <!-- 热门搜索 -->
        <div>
          <h3 class="text-sm font-medium text-ios-gray dark:text-dark-secondary mb-3">
            {{ $t('search.popularSearches') }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="term in popularSearches"
              :key="term"
              @click="searchQuery = term; performSearch()"
              class="px-3 py-1.5 bg-white dark:bg-dark-card rounded-full text-sm text-ios-dark-gray dark:text-dark-text border border-gray-200 dark:border-dark-gray hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
            >
              {{ term }}
            </button>
          </div>
        </div>
        
        <!-- 热门标签 -->
        <div>
          <h3 class="text-sm font-medium text-ios-gray dark:text-dark-secondary mb-3">
            {{ $t('search.popularTags') }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in popularTags"
              :key="tag.name"
              @click="searchQuery = tag.name; performSearch()"
              class="px-3 py-1.5 bg-white dark:bg-dark-card rounded-full text-sm text-ios-dark-gray dark:text-dark-text border border-gray-200 dark:border-dark-gray hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
            >
              {{ tag.name }} ({{ tag.stationcount }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享模态框 -->
    <ShareModal
      :visible="isShareModalVisible"
      :station="stationToShare"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import type { RadioStation } from '@/types/radio'
import { QUICK_FILTERS, POPULAR_SEARCHES } from '@/utils/constants'

import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'
import ShareModal from '@/components/ShareModal.vue'

const router = useRouter()
const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()

// 状态
const searchQuery = ref('')
const selectedCountry = ref('')
const selectedLanguage = ref('')
const searched = ref(false)
const isLoadingMore = ref(false)
const isShareModalVisible = ref(false)
const stationToShare = ref<RadioStation | null>(null)
const activeFilter = ref('')

// 使用常量
const quickFilters = QUICK_FILTERS
const popularSearches = POPULAR_SEARCHES

// 数据
const isLoading = computed(() => radioStore.isLoadingStations)
const filteredStations = computed(() => radioStore.filteredStations)
const hasMore = computed(() => radioStore.hasMore)

// 使用 computed 获取响应式数据
const countries = computed(() => radioStore.countries)
const languages = computed(() => radioStore.languages)
const tags = computed(() => radioStore.tags)
const popularTags = computed(() => tags.value.slice(0, 12))

// 搜索方法
const performSearch = async () => {
  searched.value = true
  radioStore.setSearchQuery(searchQuery.value)
  radioStore.setSelectedCountry(selectedCountry.value)
  radioStore.setSelectedLanguage(selectedLanguage.value)
  await radioStore.searchStations()
}

const onSearch = () => {
  if (searchQuery.value.length >= 2) {
    performSearch()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  radioStore.setSearchQuery('')
  searched.value = false
}

const applyFilter = (filter: string) => {
  activeFilter.value = activeFilter.value === filter ? '' : filter
  searchQuery.value = activeFilter.value || ''
  performSearch()
}

const resetFilters = () => {
  selectedCountry.value = ''
  selectedLanguage.value = ''
  activeFilter.value = ''
  radioStore.resetSearch()
  searched.value = false
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  await radioStore.loadMoreStations()
  isLoadingMore.value = false
}

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  favoritesStore.toggleFavorite(station)
}

const openShareModal = (station: RadioStation) => {
  stationToShare.value = station
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
  stationToShare.value = null
}

onMounted(async () => {
  await Promise.all([
    radioStore.loadCountries(),
    radioStore.loadLanguages(),
    radioStore.loadTags()
  ])
})
</script>
