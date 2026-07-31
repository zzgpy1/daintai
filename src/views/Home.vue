<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <!-- 顶部 -->
    <header class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-gray px-4 py-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('home.title') }}</h1>
        <p class="text-sm text-ios-gray dark:text-dark-secondary mt-1">{{ $t('home.slogan') }}</p>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- 加载/错误状态 -->
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

        <!-- 分类标签（音乐、新闻等） -->
        <div class="flex flex-wrap gap-2 overflow-x-auto pb-2">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectCategory(cat.value)"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            :class="currentCategory === cat.value ? 'bg-ios-blue text-white' : 'bg-gray-200 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- 省份分类 -->
        <div>
          <h3 class="text-sm font-semibold text-ios-gray dark:text-dark-secondary mb-2">{{ $t('home.provinces') }}</h3>
          <div class="flex flex-wrap gap-2 overflow-x-auto pb-2">
            <button
              v-for="prov in provinces"
              :key="prov.value"
              @click="selectProvince(prov.value)"
              class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              :class="currentProvince === prov.value ? 'bg-ios-blue text-white' : 'bg-gray-100 dark:bg-dark-gray text-ios-dark-gray dark:text-dark-text'"
            >
              {{ prov.label }}
            </button>
          </div>
        </div>

        <!-- 内容展示 -->
        <div v-if="currentCategory && categoryStations.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ getCategoryLabel(currentCategory) }}</h2>
            <button @click="refreshCategory" class="text-sm text-ios-blue hover:underline" :disabled="categoryLoading">
              {{ categoryLoading ? '刷新中...' : $t('home.refresh') }}
            </button>
          </div>
          <div class="space-y-3">
            <StationCard v-for="station in categoryStations" :key="station.stationuuid" :station="station" />
          </div>
        </div>

        <div v-else-if="currentProvince && provinceStations.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ getProvinceLabel(currentProvince) }}</h2>
            <button @click="refreshProvince" class="text-sm text-ios-blue hover:underline" :disabled="provinceLoading">
              {{ provinceLoading ? '刷新中...' : $t('home.refresh') }}
            </button>
          </div>
          <div class="space-y-3">
            <StationCard v-for="station in provinceStations" :key="station.stationuuid" :station="station" />
          </div>
        </div>

        <!-- 默认显示国内频道（全部） -->
        <div v-if="!currentCategory && !currentProvince">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text">{{ $t('home.china') }}</h2>
            <button @click="refreshChina" class="text-sm text-ios-blue hover:underline" :disabled="chinaLoading">
              {{ chinaLoading ? '刷新中...' : $t('home.refresh') }}
            </button>
          </div>
          <div v-if="chinaStations.length === 0" class="text-center py-4 text-ios-gray dark:text-dark-secondary">{{ $t('common.noData') }}</div>
          <div class="space-y-3">
            <StationCard v-for="station in chinaStations" :key="station.stationuuid" :station="station" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import { ArrowsRightLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import StationCard from '@/components/common/StationCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const radioStore = useRadioStore()
const playerStore = usePlayerStore()
const toastStore = useToastStore()

const loading = ref(true)
const error = ref<string | null>(null)
const randomLoading = ref(false)
const currentCategory = ref('')  // '' 表示显示国内频道
const currentProvince = ref('')  // '' 表示不筛选省份
const chinaLoading = ref(false)
const categoryLoading = ref(false)
const provinceLoading = ref(false)

// 分类定义（仅保留国内分类，所有请求默认加国家过滤）
const categories = [
  { value: '', label: '全部' },
  { value: 'music', label: '音乐' },
  { value: 'news', label: '新闻' },
  { value: 'talk', label: '谈话' },
  { value: 'sports', label: '体育' }
]

// 省份列表（从 i18n 读取）
const provinceList = [
  { value: '', label: '全部' },
  { value: '北京', label: t('province.beijing') },
  { value: '上海', label: t('province.shanghai') },
  { value: '广东', label: t('province.guangdong') },
  { value: '浙江', label: t('province.zhejiang') },
  { value: '江苏', label: t('province.jiangsu') },
  { value: '福建', label: t('province.fujian') },
  { value: '四川', label: t('province.sichuan') },
  { value: '湖北', label: t('province.hubei') },
  { value: '湖南', label: t('province.hunan') },
  { value: '河南', label: t('province.henan') },
  { value: '山东', label: t('province.shandong') },
  { value: '辽宁', label: t('province.liaoning') },
  { value: '黑龙江', label: t('province.heilongjiang') },
  { value: '吉林', label: t('province.jilin') },
  { value: '河北', label: t('province.hebei') },
  { value: '山西', label: t('province.shanxi') },
  { value: '陕西', label: t('province.shaanxi') },
  { value: '甘肃', label: t('province.gansu') },
  { value: '青海', label: t('province.qinghai') },
  { value: '云南', label: t('province.yunnan') },
  { value: '贵州', label: t('province.guizhou') },
  { value: '安徽', label: t('province.anhui') },
  { value: '江西', label: t('province.jiangxi') },
  { value: '海南', label: t('province.hainan') },
  { value: '内蒙古', label: t('province.neimenggu') },
  { value: '新疆', label: t('province.xinjiang') },
  { value: '西藏', label: t('province.xizang') },
  { value: '宁夏', label: t('province.ningxia') },
  { value: '广西', label: t('province.guangxi') },
  { value: '台湾', label: t('province.taiwan') },
  { value: '香港', label: t('province.hongkong') },
  { value: '澳门', label: t('province.macau') }
]

const provinces = computed(() => provinceList)

const chinaStations = computed(() => radioStore.chinaStations)
const categoryStations = computed(() => radioStore.categoryStations)
const provinceStations = computed(() => radioStore.provinceStations)

const getCategoryLabel = (value: string) => {
  const found = categories.find(c => c.value === value)
  return found ? found.label : value
}

const getProvinceLabel = (value: string) => {
  const found = provinceList.find(p => p.value === value)
  return found ? found.label : value
}

// 刷新国内频道（仅国内）
const refreshChina = async () => {
  chinaLoading.value = true
  try {
    await radioStore.loadChinaStations()
    toastStore.showInfo('已刷新国内频道')
  } catch {
    toastStore.showError('刷新失败')
  } finally {
    chinaLoading.value = false
  }
}

// 刷新分类（自动过滤国内）
const refreshCategory = async () => {
  if (!currentCategory.value) return
  categoryLoading.value = true
  try {
    await radioStore.loadCategoryStations(currentCategory.value)
    toastStore.showInfo(`已刷新${getCategoryLabel(currentCategory.value)}`)
  } catch {
    toastStore.showError('刷新失败')
  } finally {
    categoryLoading.value = false
  }
}

// 刷新省份
const refreshProvince = async () => {
  if (!currentProvince.value) return
  provinceLoading.value = true
  try {
    await radioStore.loadProvinceStations(currentProvince.value)
    toastStore.showInfo(`已刷新${getProvinceLabel(currentProvince.value)}`)
  } catch {
    toastStore.showError('刷新失败')
  } finally {
    provinceLoading.value = false
  }
}

// 选择分类
const selectCategory = async (tag: string) => {
  if (currentCategory.value === tag) {
    // 取消选中，回到国内频道
    currentCategory.value = ''
    radioStore.categoryStations = []
    return
  }
  currentCategory.value = tag
  currentProvince.value = '' // 清空省份筛选
  radioStore.provinceStations = []
  if (tag === '') {
    // 全部 => 显示国内频道
    radioStore.categoryStations = []
    return
  }
  await radioStore.loadCategoryStations(tag)
}

// 选择省份
const selectProvince = async (prov: string) => {
  if (currentProvince.value === prov) {
    currentProvince.value = ''
    radioStore.provinceStations = []
    return
  }
  currentProvince.value = prov
  currentCategory.value = '' // 清空分类
  radioStore.categoryStations = []
  if (prov === '') {
    radioStore.provinceStations = []
    return
  }
  await radioStore.loadProvinceStations(prov)
}

// 随机发现（只从国内频道随机）
const handleRandom = async () => {
  if (randomLoading.value) return
  randomLoading.value = true
  try {
    // 优先从国内频道随机
    if (chinaStations.value.length > 0) {
      const random = chinaStations.value[Math.floor(Math.random() * chinaStations.value.length)]
      await playerStore.playStation(random)
      return
    }
    // 降级：从热门中选（但热门也是国内）
    if (radioStore.topStations.length > 0) {
      const random = radioStore.topStations[Math.floor(Math.random() * radioStore.topStations.length)]
      await playerStore.playStation(random)
      toastStore.showInfo('从热门电台随机选择')
      return
    }
    toastStore.showError('暂无可用电台，请稍后重试')
  } catch (err) {
    console.error('随机失败', err)
    toastStore.showError('获取随机电台失败')
  } finally {
    randomLoading.value = false
  }
}

const retryLoad = () => {
  error.value = null
  loading.value = true
  initData()
}

// 初始化只加载国内数据
const initData = async () => {
  try {
    await Promise.all([
      radioStore.loadChinaStations(),
      radioStore.loadTopStations(),  // 已修改为国内热门
      radioStore.loadLatestStations(), // 已修改为国内最新
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
