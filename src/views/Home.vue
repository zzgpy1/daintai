<template>
  <div class="home-page relative">
    <!-- 顶部标题栏 -->
    <header class="mobile:block desktop:hidden sticky top-0 z-30 glass-effect border-b border-gray-200 dark:border-dark-gray px-4 py-3">
      <div class="flex items-start justify-between min-h-[44px]">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-ios-dark-gray dark:text-dark-text leading-tight max-w-[65%] break-words">{{ t('home.title') }}</h1>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="py-6 space-y-8 pb-24 md:pb-28">
      <!-- 快速操作 -->
      <section>
        <div class="grid grid-cols-2 gap-4 mobile:grid-cols-2 desktop:grid-cols-4">
          <button @click="loadRandomStations" class="relative overflow-hidden ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95 bg-gradient-to-br from-ios-blue to-purple-600 text-white border-0">
            <p class="font-semibold text-white text-lg mb-1">{{ t('home.randomDiscover') }}</p>
            <p class="text-sm text-white/80">{{ t('home.exploreNew') }}</p>
          </button>
          <button @click="$router.push('/search')" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95">
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ t('nav.search') }}</p>
          </button>
          <!-- 新增：设置快捷入口 -->
          <button @click="$router.push('/settings')" class="ios-card p-6 text-center hover:shadow-ios-lg transition-all active:scale-95">
            <Cog6ToothIcon class="w-8 h-8 text-ios-gray dark:text-dark-secondary mx-auto mb-2" />
            <p class="font-medium text-ios-dark-gray dark:text-dark-text">{{ t('nav.settings') }}</p>
          </button>
        </div>
      </section>

      <!-- 音乐电台 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-ios-dark-gray dark:text-dark-text">{{ t('home.musicStations') }}</h2>
          <button @click="refreshTopStations" class="p-2 rounded-full bg-gradient-to-r from-ios-blue to-purple-500 text-white">
            <span class="text-sm">刷新</span>
          </button>
        </div>
        <div v-if="isLoadingTop" class="space-y-3">
          <StationSkeleton v-for="i in 5" :key="i" />
        </div>
        <div v-else class="space-y-3">
          <StationCard v-for="station in topStations" :key="station.stationuuid" :station="station" @play="playStation" @favorite="toggleFavorite" />
        </div>
      </section>

      <!-- 国内热门电台 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-ios-dark-gray dark:text-dark-text">🇨🇳 国内热门电台</h2>
          <button @click="refreshChineseStations" class="p-2 rounded-full bg-gradient-to-r from-ios-blue to-purple-500 text-white">
            <span class="text-sm">刷新</span>
          </button>
        </div>
        <div v-if="isLoadingChinese" class="space-y-3">
          <StationSkeleton v-for="i in 5" :key="i" />
        </div>
        <div v-else class="space-y-3">
          <StationCard v-for="station in chineseStations" :key="station.stationuuid" :station="station" @play="playStation" @favorite="toggleFavorite" />
        </div>
      </section>
    </div>

    <!-- 右下角浮动设置按钮（PC端） -->
    <div class="hidden desktop:block fixed bottom-28 right-6 z-30">
      <button @click="$router.push('/settings')" class="p-4 bg-ios-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105">
        <Cog6ToothIcon class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useRadioStore } from '@/stores/radio'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/StationCard.vue'
import StationSkeleton from '@/components/StationSkeleton.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'

const playerStore = usePlayerStore()
const radioStore = useRadioStore()
const languageStore = useLanguageStore()
const { t } = languageStore

const topStations = ref<RadioStation[]>([])
const chineseStations = ref<RadioStation[]>([])
const isLoadingTop = ref(true)
const isLoadingChinese = ref(true)

const playStation = (station: RadioStation) => {
  playerStore.playStation(station)
}

const toggleFavorite = (station: RadioStation) => {
  playerStore.toggleFavorite(station)
}

const loadRandomStations = async () => {
  await radioStore.loadRandomStations()
}

const refreshTopStations = async () => {
  isLoadingTop.value = true
  await radioStore.loadTopStations({ force: true })
  topStations.value = radioStore.topStations.slice(0, 10)
  isLoadingTop.value = false
}

const refreshChineseStations = async () => {
  isLoadingChinese.value = true
  const results = await radioStore.getChineseTopStations(15)
  chineseStations.value = results
  isLoadingChinese.value = false
}

onMounted(async () => {
  // 加载热门电台
  isLoadingTop.value = true
  await radioStore.loadTopStations()
  topStations.value = radioStore.topStations.slice(0, 10)
  isLoadingTop.value = false

  // 加载中文电台
  isLoadingChinese.value = true
  const results = await radioStore.getChineseTopStations(15)
  chineseStations.value = results
  isLoadingChinese.value = false
})
</script>
