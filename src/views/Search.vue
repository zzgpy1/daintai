<template>
  <!-- 保持原样，仅修改脚本部分 -->
  ...
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRadioStore } from '@/stores/radio'
import BackButton from '@/components/common/BackButton.vue'
import StationCard from '@/components/common/StationCard.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const radioStore = useRadioStore()
const searchQuery = ref('')
const selectedCountry = ref('')
const selectedLanguage = ref('')

const countries = ref<any[]>([])
const languages = ref<any[]>([])

let abortController: AbortController | null = null

const onSearch = async () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  abortController = new AbortController()
  radioStore.searchQuery = searchQuery.value
  radioStore.selectedCountry = selectedCountry.value
  radioStore.selectedLanguage = selectedLanguage.value
  try {
    await radioStore.searchStations(undefined, abortController.signal)
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.log('搜索已取消')
    } else {
      console.error('搜索失败', err)
    }
  } finally {
    abortController = null
  }
}

let debounceTimer: NodeJS.Timeout | null = null
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(onSearch, 500)
})

onBeforeUnmount(() => {
  if (abortController) abortController.abort()
})

// 其余保持不变
</script>
