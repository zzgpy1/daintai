<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-24">
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-gray px-4 py-4">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('home.title') }}</h1>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button @click="$router.push('/settings')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray">
            <Cog6ToothIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-ios-red">{{ error }}</p>
        <button @click="retryLoad" class="mt-4 px-6 py-2 bg-ios-blue text-white rounded-ios hover:bg-blue-600">{{ $t('common.retry') }}</button>
      </div>

      <template v-else>
        <!-- 快速操作 -->
        <div class="grid grid-cols-2 gap-4">
          <button @click="handleRandom" class="ios-card p-6 text-center hover:shadow-lg transition-all active:scale-95" :disabled="randomLoading">
            <ArrowsRightLeftIcon class="w-8 h-8 text-ios-blue mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ randomLoading ? '获取中...' : $t('home.random') }}</p>
          </button>
          <button @click="$router.push('/search')" class="ios-card p-6 text-center hover:shadow-lg transition-all active:scale-95">
            <MagnifyingGlassIcon class="w-8 h-8 text-ios-green mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('nav.search') }}</p>
          </button>
        </div>

        <!-- 分类选项卡 -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectCategory(cat.value)"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="currentCategory === cat.value ? 'bg-ios-blue text-white' : 'bg-gray-200 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- 显示内容 -->
        <div v-if="currentCategory && categoryStations.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ getCategoryLabel(currentCategory) }}</h2>
            <button @click="refreshCategory" class="text-sm text-ios-blue hover:underline">{{ $t('home.refresh') }}</button>
          </div>
          <div class="space-y-3">
            <StationCard v-for="station in categoryStations" :key="station.stationuuid" :station="station" />
          </div>
        </div>

        <!-- 国内频道（默认） -->
        <div v-if="!currentCategory">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('home.china') }}</h2>
            <button @click="loadChinaStations" class="text-sm text-ios-blue hover:underline">{{ $t('home.refresh') }}</button>
          </div>
          <div v-if="chinaStations.length === 0" class="text-center py-4 text-ios-gray dark:text-dark-secondary">{{ $t('common.noData') }}</div>
          <div class="space-y-3">
            <StationCard v-for="station in chinaStations" :key="station.stationuuid" :station="station" />
          </div>
        </div>

        <!-- 热门电台（保留） -->
        <section v-if="!currentCategory">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('home.popular') }}</h2>
            <button @click="loadTopStations" class="text-sm text-ios-blue hover:underline">{{ $t('home.refresh') }}</button>
          </div>
          <div v-if="topStations.length === 0" class="text-center py-4 text-ios-gray dark:text-dark-secondary">{{ $t('common.noData') }}</div>
          <div class="space-y-3">
            <StationCard v-for="station in topStations.slice(0, 10)" :key="station.stationuuid" :station="station" />
          </div>
        </section>

        <section v-if="!currentCategory">
          <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">{{ $t('home.latest') }}</h2>
          <div v-if="latestStations.length === 0" class="text-center py-4 text-ios-gray dark:text-dark-secondary">{{ $t('common.noData') }}</div>
          <div class="space-y-3">
            <StationCard v-for="station in latestStations.slice(0, 10)" :key="station.stationuuid" :station="station" />
          </div>
        </section>
      </template>
    </div>
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import { Cog6ToothIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import StationCard from '@/components/common/StationCard.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'

const router = useRouter()
const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const toastStore = useToastStore()

const loading = ref(true)
const error = ref<string | null>(null)
const randomLoading = ref(false)
const currentCategory = ref('')

// 分类定义
const categories = [
  { value: 'music', label: '音乐' },
  { value: 'sports', label: '体育' },
  { value: 'news', label: '新闻' },
  { value: 'talk', label: '谈话' },
  { value: 'classical', label: '古典' },
  { value: 'jazz', label: '爵士' },
  { value: 'rock', label: '摇滚' },
  { value: 'pop', label: '流行' }
]

const chinaStations = computed(() => radioStore.chinaStations)
const categoryStations = computed(() => radioStore.categoryStations)
const topStations = computed(() => radioStore.topStations)
const latestStations = computed(() => radioStore.latestStations)

const getCategoryLabel = (value: string) => {
  const found = categories.find(c => c.value === value)
  return found ? found.label : value
}

const loadChinaStations = async () => {
  await radioStore.loadChinaStations()
}

const loadTopStations = async () => {
  await radioStore.loadTopStations()
}

const loadLatestStations = async () => {
  await radioStore.loadLatestStations()
}

const selectCategory = async (tag: string) => {
  if (currentCategory.value === tag) {
    // 如果已选中，取消选中，回到国内频道
    currentCategory.value = ''
    radioStore.categoryStations = []
    return
  }
  currentCategory.value = tag
  await radioStore.loadCategoryStations(tag)
}

const refreshCategory = () => {
  if (currentCategory.value) {
    radioStore.loadCategoryStations(currentCategory.value)
  } else {
    loadChinaStations()
  }
}

const handleRandom = async () => {
  if (randomLoading.value) return
  randomLoading.value = true
  try {
    const stations = await radioStore.searchStations({ order: 'random', limit: 30 })
    if (stations.length > 0) {
      const random = stations[Math.floor(Math.random() * stations.length)]
      await playerStore.playStation(random)
    } else {
      toastStore.showError('暂无随机电台，请稍后重试')
    }
  } catch (err) {
    console.error('随机失败', err)
    toastStore.showError('获取随机电台失败，请检查网络')
  } finally {
    randomLoading.value = false
  }
}

const retryLoad = () => {
  error.value = null
  loading.value = true
  initData()
}

const initData = async () => {
  try {
    await Promise.all([
      loadChinaStations(),
      loadTopStations(),
      loadLatestStations(),
      radioStore.loadCountries()
    ])
    error.value = null
  } catch (e) {
    error.value = '加载数据失败，请检查网络连接后重试'
  } finally {
    loading.value = false
  }
}

onMounted(initData)
</script>
