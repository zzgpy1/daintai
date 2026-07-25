<template>
  <div class="station-detail-page min-h-screen bg-white dark:bg-black">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center h-96">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-20">
      <div class="max-w-md mx-auto px-6">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon class="w-10 h-10 text-red-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">无法加载电台</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">{{ error }}</p>
        <button @click="$router.push('/')" class="inline-flex items-center gap-2 bg-ios-blue text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all">
          <HomeIcon class="w-5 h-5" />
          返回首页
        </button>
      </div>
    </div>

    <!-- 电台详情内容 -->
    <div v-else-if="station" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white/95 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl dark:border dark:border-gray-700/30 overflow-hidden">
        <!-- 顶部背景区域 -->
        <div class="relative h-64 md:h-[420px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30">
          <div class="absolute inset-0 bg-white/10 dark:bg-black/20"></div>
          
          <!-- 浮动装饰 -->
          <div class="absolute inset-0 overflow-hidden">
            <div class="floating-orb floating-orb-1"></div>
            <div class="floating-orb floating-orb-2"></div>
            <div class="floating-orb floating-orb-3"></div>
          </div>
          
          <!-- 电台图标和唱片效果 -->
          <div class="relative z-10 flex flex-col items-center mt-12 md:mt-8">
            <div class="relative group mb-6">
              <!-- 唱片外圈 -->
              <div class="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-800/80 dark:bg-black/80 flex items-center justify-center shadow-2xl"
                   :class="{ 'animate-spin-slow': isCurrentAndPlaying }">
                <!-- 内层标签 -->
                <div class="w-22 h-22 md:w-32 md:h-32 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <img 
                    v-if="station.favicon && !faviconError" 
                    :src="station.favicon" 
                    @error="faviconError = true"
                    class="w-16 h-16 md:w-24 md:h-24 object-cover rounded-full"
                    alt="电台图标"
                  />
                  <div v-else class="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-ios-blue to-purple-600 flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
                    {{ getInitial(station.name) }}
                  </div>
                </div>
                
                <!-- 唱片纹理 -->
                <div class="absolute inset-2 rounded-full border border-gray-600/30"></div>
                <div class="absolute inset-4 rounded-full border border-gray-600/20"></div>
                <div class="absolute inset-6 rounded-full border border-gray-600/15"></div>
              </div>
            </div>

            <!-- 音频可视化 -->
            <div class="audio-visualizer-container" ref="visualizerContainer">
              <canvas
                ref="visualizerCanvas"
                :width="canvasWidth"
                :height="canvasHeight"
                class="rainbow-visualizer-canvas"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- 信息区域 -->
        <div class="p-4 md:p-8 bg-white dark:bg-transparent">
          <div class="text-center mb-4 md:mb-8">
            <h1 class="text-xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">{{ station.name }}</h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-3 md:mb-4">{{ station.country }}</p>
            
            <!-- 标签 -->
            <div class="flex flex-wrap justify-center gap-1.5 md:gap-2">
              <span v-for="(tag, index) in formattedTags.slice(0, 6)" :key="tag"
                    class="px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-700 dark:text-gray-300 text-xs md:text-sm rounded-full border border-blue-200/50 dark:border-blue-700/50"
                    :style="{ animationDelay: `${index * 50}ms` }">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="flex justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <button 
              @click="playStation"
              class="flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-ios-blue to-blue-600 text-white font-semibold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <component :is="playButtonIcon" class="w-5 h-5 md:w-6 md:h-6" />
              <span class="text-sm md:text-lg">{{ isCurrentAndPlaying ? '暂停' : '播放' }}</span>
            </button>
          </div>

          <!-- 次要操作 -->
          <div class="flex justify-center gap-4 md:gap-6">
            <button 
              @click="toggleFavorite"
              class="flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50 transform hover:scale-105"
              :class="isFavorite ? 'text-red-500' : 'text-gray-500'"
            >
              <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center"
                   :class="isFavorite ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'">
                <HeartIcon class="w-5 h-5 md:w-6 h-6" :class="{ 'fill-current': isFavorite }" />
              </div>
              <span class="text-xs md:text-sm font-medium">{{ isFavorite ? '已收藏' : '添加收藏' }}</span>
            </button>

            <button 
              @click="openShareModal"
              class="flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50 transform hover:scale-105 text-gray-500"
            >
              <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl flex items-center justify-center">
                <ShareIcon class="w-5 h-5 md:w-6 h-6" />
              </div>
              <span class="text-xs md:text-sm font-medium">分享</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享模态框 -->
    <ShareModal :visible="isShareModalVisible" :station="station" @close="closeShareModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import type { RadioStation } from '@/types/radio'

import { 
  ExclamationTriangleIcon, 
  HomeIcon, 
  PlayIcon, 
  PauseIcon, 
  HeartIcon, 
  ShareIcon 
} from '@heroicons/vue/24/outline'

import ShareModal from '@/components/ShareModal.vue'

// ============================================
// Stores
// ============================================
const route = useRoute()
const router = useRouter()
const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

// ============================================
// 状态
// ============================================
const station = ref<RadioStation | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isShareModalVisible = ref(false)
const faviconError = ref(false)

// ============================================
// 可视化相关
// ============================================
const visualizerContainer = ref<HTMLDivElement>()
const visualizerCanvas = ref<HTMLCanvasElement>()
const canvasWidth = ref(320)
const canvasHeight = ref(60)
let animationId: number | null = null

// ============================================
// 计算属性
// ============================================
const stationUuid = computed(() => route.params.uuid as string)

const isCurrentAndPlaying = computed(() => {
  return playerStore.currentStation?.stationuuid === station.value?.stationuuid && playerStore.isPlaying
})

const isFavorite = computed(() => {
  if (!station.value) return false
  return favoritesStore.isFavorite(station.value.stationuuid)
})

const playButtonIcon = computed(() => {
  return isCurrentAndPlaying.value ? PauseIcon : PlayIcon
})

const formattedTags = computed(() => {
  if (!station.value?.tags) return []
  return station.value.tags.split(',').map(tag => tag.trim()).filter(Boolean)
})

// ============================================
// 辅助方法
// ============================================
const getInitial = (name: string): string => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// ============================================
// 播放控制
// ============================================
const playStation = () => {
  if (!station.value) return
  if (isCurrentAndPlaying.value) {
    playerStore.pauseStation()
  } else {
    playerStore.playStation(station.value)
  }
}

const toggleFavorite = () => {
  if (!station.value) return
  favoritesStore.toggleFavorite(station.value)
}

const openShareModal = () => {
  isShareModalVisible.value = true
}

const closeShareModal = () => {
  isShareModalVisible.value = false
}

// ============================================
// 音频可视化
// ============================================
const startVisualizer = () => {
  if (!visualizerCanvas.value) return
  const canvas = visualizerCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const w = canvas.width
    const h = canvas.height
    const now = performance.now()
    
    const barCount = 32
    const barWidth = w / barCount * 0.7
    const gap = w / barCount * 0.3
    
    for (let i = 0; i < barCount; i++) {
      const hue = (now / 50 + i * 10) % 360
      const height = (Math.sin(now / 1000 + i * 0.5) * 0.4 + 0.6) * h * 0.8
      const x = i * (barWidth + gap) + gap / 2
      const y = h - height - 4
      
      ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.8)`
      ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.3)`
      ctx.shadowBlur = 10
      
      // 绘制圆角矩形
      const radius = 3
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + barWidth - radius, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
      ctx.lineTo(x + barWidth, y + height - radius)
      ctx.quadraticCurveTo(x + barWidth, y + height, x + barWidth - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fill()
    }
    
    animationId = requestAnimationFrame(draw)
  }
  
  draw()
}

const stopVisualizer = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const updateCanvasSize = () => {
  if (!visualizerContainer.value) return
  const containerWidth = visualizerContainer.value.offsetWidth
  canvasWidth.value = Math.min(560, containerWidth > 0 ? containerWidth : 560)
  canvasHeight.value = window.innerWidth >= 768 ? 84 : 72
}

// ============================================
// 生命周期
// ============================================
onMounted(async () => {
  try {
    const result = await radioStore.getStationByUuid(stationUuid.value)
    if (result) {
      station.value = result
      document.title = `${result.name} | 全球电台`
    } else {
      error.value = '未找到该电台'
    }
  } catch (e: any) {
    error.value = e.message || '加载失败'
  } finally {
    isLoading.value = false
  }

  await nextTick()
  updateCanvasSize()
  
  setTimeout(() => {
    startVisualizer()
  }, 300)

  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  stopVisualizer()
  window.removeEventListener('resize', updateCanvasSize)
})
</script>

<style scoped>
/* ============================================
   动画
   ============================================ */
.animate-spin-slow {
  animation: spin 12s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================
   浮动装饰
   ============================================ */
.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  animation: float 20s infinite linear;
}

.floating-orb-1 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, rgba(255, 107, 107, 0) 70%);
  top: 5%;
  left: 5%;
  animation-duration: 20s;
  animation-delay: -3s;
}

.floating-orb-2 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, rgba(78, 205, 196, 0) 70%);
  top: 70%;
  right: 10%;
  animation-duration: 25s;
  animation-delay: -8s;
}

.floating-orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(199, 121, 208, 0.2) 0%, rgba(199, 121, 208, 0) 70%);
  bottom: 10%;
  left: 15%;
  animation-duration: 30s;
  animation-delay: -12s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-10px) translateX(-15px) scale(0.9);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-30px) translateX(5px) scale(1.05);
    opacity: 0.8;
  }
}

/* ============================================
   音频可视化
   ============================================ */
.audio-visualizer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(560px, 100%);
  padding: 0 16px;
  position: relative;
  z-index: 20;
  pointer-events: none;
  margin-top: -0.5rem;
}

.rainbow-visualizer-canvas {
  background: transparent;
  border-radius: 9999px;
  display: block;
  width: 100%;
  height: auto;
}

/* ============================================
   响应式
   ============================================ */
@media (max-width: 640px) {
  .floating-orb-1 {
    width: 100px;
    height: 100px;
  }
  .floating-orb-2 {
    width: 70px;
    height: 70px;
  }
  .floating-orb-3 {
    width: 120px;
    height: 120px;
  }
}
</style>
