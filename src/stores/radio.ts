import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { radioAPI } from '@/services/radioApi'
import type { RadioStation, Country, Language, Tag } from '@/types/radio'
import { useToastStore } from './toast'
import { localStations } from '@/config/localStations'

// 省份 → 地级市列表（与之前相同，完整保留）
const PROVINCE_CITIES: Record<string, string[]> = {
  '北京': ['北京'],
  '上海': ['上海'],
  '天津': ['天津'],
  '重庆': ['重庆'],
  '广东': ['广州', '深圳', '珠海', '汕头', '佛山', '韶关', '湛江', '肇庆', '江门', '茂名', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
  '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝', '甘孜', '凉山'],
  '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西'],
  '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
  '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城'],
  '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
  '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
  '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南'],
  '青海': ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'],
  '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南', '黔东南', '黔南'],
  '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
  '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
  '海南': ['海口', '三亚', '三沙', '儋州', '五指山', '琼海', '文昌', '万宁', '东方'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安', '锡林郭勒', '阿拉善'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'],
  '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
  '台湾': ['台北', '高雄', '台中', '台南', '基隆', '新竹', '嘉义'],
  '香港': ['香港'],
  '澳门': ['澳门']
}

export const useRadioStore = defineStore('radio', () => {
  const toastStore = useToastStore()
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const chinaStations = ref<RadioStation[]>([])
  const categoryStations = ref<RadioStation[]>([])
  const provinceStations = ref<RadioStation[]>([])
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('CN')
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const currentCategory = ref<string>('')

  // ---------- 失效管理（按 stationuuid）----------
  const getInvalidUUIDs = (): Set<string> => {
    try {
      const data = localStorage.getItem('invalid_stations')
      if (data) {
        const uuids = JSON.parse(data)
        return new Set(uuids)
      }
    } catch {}
    return new Set()
  }

  const saveInvalidUUIDs = (uuids: Set<string>) => {
    localStorage.setItem('invalid_stations', JSON.stringify(Array.from(uuids)))
  }

  const markInvalid = (station: RadioStation) => {
    const invalid = getInvalidUUIDs()
    invalid.add(station.stationuuid)
    saveInvalidUUIDs(invalid)
    // 从所有列表中移除
    const filterList = (list: RadioStation[]) => list.filter(s => s.stationuuid !== station.stationuuid)
    chinaStations.value = filterList(chinaStations.value)
    categoryStations.value = filterList(categoryStations.value)
    provinceStations.value = filterList(provinceStations.value)
    topStations.value = filterList(topStations.value)
    latestStations.value = filterList(latestStations.value)
    stations.value = filterList(stations.value)
  }

  // ---------- 合并本地源与 API，构建备用 URL 列表 ----------
  const mergeWithLocal = (apiStations: RadioStation[]): RadioStation[] => {
    const invalidUUIDs = getInvalidUUIDs()
    // 深拷贝本地源，初始化 allUrls
    let merged = localStations.map(s => ({
      ...s,
      allUrls: [s.url]
    }))

    // 处理 API 结果
    for (const api of apiStations) {
      if (invalidUUIDs.has(api.stationuuid)) continue
      // 查找匹配的本地电台（按名称和 countrycode）
      const matched = merged.find(local =>
        local.name === api.name && local.countrycode === api.countrycode
      )
      if (matched) {
        // 合并备用 URL
        const urls = [matched.url, api.url, api.url_resolved]
        const uniqueUrls = Array.from(new Set(urls.filter(u => u && u.trim())))
        matched.allUrls = uniqueUrls
        // 补充其他字段（如有需要）
        if (!matched.favicon && api.favicon) matched.favicon = api.favicon
        if (!matched.tags && api.tags) matched.tags = api.tags
        if (!matched.codec && api.codec) matched.codec = api.codec
        if (!matched.bitrate && api.bitrate) matched.bitrate = api.bitrate
      } else {
        // 未匹配的 API 电台直接加入
        const newStation = {
          ...api,
          allUrls: [api.url, api.url_resolved].filter(u => u && u.trim())
        }
        merged.push(newStation)
      }
    }

    // 过滤失效
    return merged.filter(s => !invalidUUIDs.has(s.stationuuid))
  }

  // 本地源按标签过滤（含失效过滤）
  const filterLocalByTag = (tag: string): RadioStation[] => {
    const invalidUUIDs = getInvalidUUIDs()
    return localStations
      .filter(s => !invalidUUIDs.has(s.stationuuid))
      .filter(s => s.tags.includes(tag))
      .map(s => ({ ...s, allUrls: [s.url] }))
  }

  // ---------- 核心数据加载 ----------
  const filteredStations = computed(() => {
    let filtered = stations.value
    filtered = filtered.filter(s => s.countrycode === 'CN' || s.country.toLowerCase().includes('china'))
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q) ||
        (s.language && s.language.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q))
      )
    }
    if (selectedCountry.value) {
      filtered = filtered.filter(s => s.countrycode === selectedCountry.value)
    }
    if (selectedLanguage.value) {
      filtered = filtered.filter(s => s.language?.toLowerCase().includes(selectedLanguage.value.toLowerCase()))
    }
    if (selectedTag.value) {
      filtered = filtered.filter(s => s.tags.toLowerCase().includes(selectedTag.value.toLowerCase()))
    }
    return filtered
  })

  const searchStations = async (query?: string, signal?: AbortSignal) => {
    if (query) searchQuery.value = query
    isLoading.value = true
    error.value = null
    try {
      const params: any = { limit: 100, hidebroken: true, countrycode: 'CN' }
      if (searchQuery.value) params.name = searchQuery.value
      if (selectedCountry.value) params.countrycode = selectedCountry.value
      if (selectedLanguage.value) params.language = selectedLanguage.value
      if (selectedTag.value) params.tag = selectedTag.value
      const apiResults = await radioAPI.searchStations(params, signal)
      // 合并本地源（本地源也按关键词过滤）
      const invalidUUIDs = getInvalidUUIDs()
      let localFiltered = localStations.filter(s => !invalidUUIDs.has(s.stationuuid))
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase().trim()
        localFiltered = localFiltered.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.tags.toLowerCase().includes(q)
        )
      }
      if (selectedCountry.value) {
        localFiltered = localFiltered.filter(s => s.countrycode === selectedCountry.value)
      }
      if (selectedLanguage.value) {
        localFiltered = localFiltered.filter(s => s.language?.toLowerCase().includes(selectedLanguage.value.toLowerCase()))
      }
      if (selectedTag.value) {
        localFiltered = localFiltered.filter(s => s.tags.toLowerCase().includes(selectedTag.value.toLowerCase()))
      }
      // 合并结果（去重）
      const merged = [...localFiltered]
      const localUrls = new Set(merged.map(s => s.url))
      for (const api of apiResults) {
        if (!invalidUUIDs.has(api.stationuuid) && !localUrls.has(api.url)) {
          merged.push({ ...api, allUrls: [api.url, api.url_resolved].filter(u => u) })
        }
      }
      stations.value = merged
      if (stations.value.length === 0) {
        toastStore.showInfo('没有找到匹配的国内电台')
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('搜索已取消')
        return
      }
      error.value = '搜索失败，请检查网络'
      console.error(err)
      toastStore.showError('搜索失败，请稍后重试')
    } finally {
      isLoading.value = false
    }
    return stations.value
  }

  const loadTopStations = async () => {
    isLoading.value = true
    try {
      const result = await radioAPI.searchStations({
        order: 'clickcount',
        limit: 50,
        reverse: true,
        countrycode: 'CN',
        hidebroken: true
      })
      topStations.value = mergeWithLocal(result)
    } catch (err) {
      console.error('加载热门电台失败:', err)
      try {
        const result = await radioAPI.searchStations({ countrycode: 'CN', limit: 50, hidebroken: true })
        topStations.value = mergeWithLocal(result)
        toastStore.showInfo('使用备用方式加载热门电台')
      } catch (e) {
        toastStore.showError('加载热门电台失败')
        topStations.value = localStations.filter(s => !getInvalidUUIDs().has(s.stationuuid)).map(s => ({ ...s, allUrls: [s.url] }))
      }
    } finally {
      isLoading.value = false
    }
  }

  const loadLatestStations = async () => {
    isLoading.value = true
    try {
      const result = await radioAPI.searchStations({
        order: 'name',
        limit: 30,
        countrycode: 'CN',
        hidebroken: true
      })
      latestStations.value = mergeWithLocal(result)
    } catch (err) {
      console.error('加载最新电台失败:', err)
      try {
        const result = await radioAPI.searchStations({ countrycode: 'CN', limit: 30, hidebroken: true })
        latestStations.value = mergeWithLocal(result)
        toastStore.showInfo('使用备用方式加载最新电台')
      } catch (e) {
        toastStore.showError('加载最新电台失败')
        latestStations.value = localStations.filter(s => !getInvalidUUIDs().has(s.stationuuid)).map(s => ({ ...s, allUrls: [s.url] }))
      }
    } finally {
      isLoading.value = false
    }
  }

  const loadChinaStations = async () => {
    isLoading.value = true
    try {
      let apiStations: RadioStation[] = []
      try {
        apiStations = await radioAPI.getStationsByCountry('CN', 50)
      } catch (e) {
        console.warn('API 获取国内电台失败，仅使用本地源', e)
      }
      chinaStations.value = mergeWithLocal(apiStations)
      if (chinaStations.value.length === 0) {
        const fallback = await radioAPI.searchStations({ country: 'China', limit: 50 })
        chinaStations.value = mergeWithLocal(fallback)
      }
    } catch (err) {
      console.error('加载国内电台失败:', err)
      chinaStations.value = localStations.filter(s => !getInvalidUUIDs().has(s.stationuuid)).map(s => ({ ...s, allUrls: [s.url] }))
      toastStore.showError('加载国内电台失败，已显示本地源')
    } finally {
      isLoading.value = false
    }
  }

  const loadCategoryStations = async (tag: string) => {
    if (!tag) {
      categoryStations.value = []
      return
    }
    isLoading.value = true
    currentCategory.value = tag
    try {
      // 本地过滤
      const localFiltered = filterLocalByTag(tag)
      let apiStations: RadioStation[] = []
      try {
        apiStations = await radioAPI.searchStations({
          tag,
          countrycode: 'CN',
          limit: 50,
          hidebroken: true
        })
      } catch (e) {
        console.warn(`API 加载分类 ${tag} 失败，仅使用本地源`, e)
      }
      // 合并
      const result = [...localFiltered]
      const localUrls = new Set(result.map(s => s.url))
      const invalidUUIDs = getInvalidUUIDs()
      for (const api of apiStations) {
        if (!invalidUUIDs.has(api.stationuuid) && !localUrls.has(api.url) && api.tags.includes(tag)) {
          result.push({ ...api, allUrls: [api.url, api.url_resolved].filter(u => u) })
        }
      }
      categoryStations.value = result
      if (result.length === 0) {
        toastStore.showInfo(`未找到国内“${tag}”分类的电台`)
      }
    } catch (err) {
      console.error(`加载分类 ${tag} 失败:`, err)
      toastStore.showError(`加载分类失败`)
    } finally {
      isLoading.value = false
    }
  }

  const loadProvinceStations = async (province: string) => {
    if (!province) {
      provinceStations.value = []
      return
    }
    isLoading.value = true
    try {
      const cities = PROVINCE_CITIES[province] || []
      const searchPromises: Promise<RadioStation[]>[] = []
      const provinceVariants = [province, province + '省', province + '市']
      for (const pName of provinceVariants) {
        searchPromises.push(radioAPI.searchStations({ state: pName, countrycode: 'CN', limit: 500, hidebroken: true }).catch(() => []))
        searchPromises.push(radioAPI.searchStations({ name: pName, countrycode: 'CN', limit: 500, hidebroken: true }).catch(() => []))
        searchPromises.push(radioAPI.searchStations({ tag: pName, countrycode: 'CN', limit: 500, hidebroken: true }).catch(() => []))
      }
      for (const city of cities) {
        searchPromises.push(radioAPI.searchStations({ state: city, countrycode: 'CN', limit: 500, hidebroken: true }).catch(() => []))
        searchPromises.push(radioAPI.searchStations({ name: city, countrycode: 'CN', limit: 500, hidebroken: true }).catch(() => []))
      }
      const results = await Promise.all(searchPromises)
      const allStations = results.flat()
      const invalidUUIDs = getInvalidUUIDs()
      const unique = allStations.filter((item, index, self) =>
        index === self.findIndex(s => s.stationuuid === item.stationuuid) &&
        !invalidUUIDs.has(item.stationuuid)
      ).map(s => ({ ...s, allUrls: [s.url, s.url_resolved].filter(u => u) }))
      provinceStations.value = unique
      if (unique.length === 0) {
        toastStore.showInfo(`未找到 ${province} 的电台`)
      } else {
        toastStore.showInfo(`找到 ${unique.length} 个 ${province} 的电台`)
      }
    } catch (err) {
      console.error(`加载省份 ${province} 失败:`, err)
      toastStore.showError(`加载 ${province} 电台失败`)
      provinceStations.value = []
    } finally {
      isLoading.value = false
    }
  }

  const loadCountries = async () => {
    try {
      countries.value = await radioAPI.getCountries()
    } catch (err) {
      console.error('加载国家列表失败:', err)
    }
  }

  const loadLanguages = async () => {
    try {
      languages.value = await radioAPI.getLanguages()
    } catch (err) {
      console.error('加载语言列表失败:', err)
    }
  }

  const loadTags = async () => {
    try {
      tags.value = await radioAPI.getTags()
    } catch (err) {
      console.error('加载标签列表失败:', err)
    }
  }

  const getStationByUUID = async (uuid: string): Promise<RadioStation | null> => {
    const local = localStations.find(s => s.stationuuid === uuid)
    if (local) return { ...local, allUrls: [local.url] }
    try {
      const api = await radioAPI.getStationByUUID(uuid)
      if (api) return { ...api, allUrls: [api.url, api.url_resolved].filter(u => u) }
    } catch (err) {
      console.error('获取电台详情失败:', err)
    }
    return null
  }

  const resetSearch = () => {
    searchQuery.value = ''
    selectedCountry.value = 'CN'
    selectedLanguage.value = ''
    selectedTag.value = ''
    stations.value = []
  }

  const clearInvalid = () => {
    localStorage.removeItem('invalid_stations')
    loadChinaStations()
    loadTopStations()
    loadLatestStations()
    toastStore.showInfo('已重置失效列表')
  }

  return {
    stations,
    topStations,
    latestStations,
    chinaStations,
    categoryStations,
    provinceStations,
    countries,
    languages,
    tags,
    isLoading,
    error,
    searchQuery,
    selectedCountry,
    selectedLanguage,
    selectedTag,
    currentCategory,
    filteredStations,
    searchStations,
    loadTopStations,
    loadLatestStations,
    loadChinaStations,
    loadCategoryStations,
    loadProvinceStations,
    loadCountries,
    loadLanguages,
    loadTags,
    getStationByUUID,
    resetSearch,
    markInvalid,
    clearInvalid
  }
})
