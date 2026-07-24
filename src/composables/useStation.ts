import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RadioStation } from '@/types/radio'
import { generateIconDataUrl } from '@/utils/iconGenerator'
import { getLocalizedCountryName } from '@/utils/countryTranslation'

export function useStation(station: RadioStation) {
  const router = useRouter()
  const showFallback = ref(false)

  const generatedIconUrl = computed(() => {
    return generateIconDataUrl(station.name)
  })

  const getCountryName = (countryCode?: string) => {
    if (!countryCode) return '未知'
    return getLocalizedCountryName(countryCode)
  }

  const goToDetail = () => {
    router.push(`/station/${station.stationuuid}`)
  }

  const formatTags = (tags: string, max: number = 5) => {
    if (!tags) return []
    return tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, max)
  }

  return {
    showFallback,
    generatedIconUrl,
    getCountryName,
    goToDetail,
    formatTags
  }
}
