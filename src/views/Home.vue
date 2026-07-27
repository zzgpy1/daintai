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

    <div class="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">加载中...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-ios-red">{{ error }}</p>
        <button @click="retryLoad" class="mt-4 px-6 py-2 bg-ios-blue text-white rounded-ios hover:bg-blue-600">
          重试
        </button>
      </div>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <button @click="loadRandom" class="ios-card p-6 text-center hover:shadow-lg transition-all active:scale-95">
            <ArrowsRightLeftIcon class="w-8 h-8 text-ios-blue mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('home.random') }}</p>
          </button>
          <button @click="$router.push('/search')" class="ios-card p-6 text-center hover:shadow-lg transition-all active:scale-95">
            <MagnifyingGlassIcon class="w-8 h-8 text-ios-green mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('nav.search') }}</p>
          </button>
        </div>

        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('home.popular') }}</h2>
            <button @click="loadTopStations" class="text-sm text-ios-blue hover:underline">刷新</button>
          </div>
          <div v-if="topStations.length === 0" class="text-center py-4 text-ios-gray dark:text-dark-secondary">暂无数据</div>
          <div class="space-y-3">
            <StationCard v-for="station in topStations.slice(0, 10)" :key="station.stationuuid" :station="station" />
          </div>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text mb-4">{{ $t('home.latest') }}</h2>
          <div v-if="latestStations.length === 0" class="text-center py-4 text-ios-gray dark:text-dark-secondary">暂无数据</div>
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
import { ref, onMounted } from 'vue'
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

const topStations = ref<any[]>([])
const latestStations = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadTopStations = async () => {
  await radioStore.loadTopStations()
  topStations.value = radioStore.topStations
}

const loadLatestStations = async () => {
  await radioStore.loadLatestStations()
  latestStations.value = radioStore.latestStations
}

const loadRandom = async () => {
  try {
    const stations = await radioStore.searchStations({ order: 'random', limit: 30 })
    if (stations.length > 0) {
      const random = stations[Math.floor(Math.random() * stations.length)]
      await playerStore.playStation(random)
    } else {
      toastStore.showError('没有找到随机电台')
    }
  } catch {
    toastStore.showError('获取随机电台失败')
  }
}

const retryLoad = () => {
  error.value = null
  loading.value = true
  initData()
}

const initData = async () => {
  try {
    await Promise.all([loadTopStations(), loadLatestStations()])
    await radioStore.loadCountries()
    error.value = null
  } catch (e) {
    error.value = '加载数据失败，请检查网络连接后重试'
  } finally {
    loading.value = false
  }
}

onMounted(initData)
</script>
