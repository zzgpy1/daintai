import { onMounted, onUnmounted, ref } from 'vue'

export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  options: {
    threshold?: number
    isLoading?: () => boolean
    hasMore?: () => boolean
  } = {}
) {
  const {
    threshold = 200,
    isLoading = () => false,
    hasMore = () => true
  } = options

  const isNearBottom = ref(false)
  let throttleTimer: number | null = null

  const handleScroll = async () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const distanceToBottom = documentHeight - (scrollTop + windowHeight)
    isNearBottom.value = distanceToBottom <= threshold

    if (isNearBottom.value && !isLoading() && hasMore()) {
      try {
        await loadMore()
      } catch (error) {
        console.error('加载更多数据失败:', error)
      }
    }
  }

  const throttledScroll = () => {
    if (throttleTimer) return
    throttleTimer = window.setTimeout(() => {
      handleScroll()
      throttleTimer = null
    }, 100)
  }

  onMounted(() => window.addEventListener('scroll', throttledScroll, { passive: true }))
  onUnmounted(() => {
    window.removeEventListener('scroll', throttledScroll)
    if (throttleTimer) clearTimeout(throttleTimer)
  })

  return { isNearBottom }
}
