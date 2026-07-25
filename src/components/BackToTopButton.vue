<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-2 opacity-0"
  >
    <button
      v-if="showButton"
      @click="scrollToTop"
      class="fixed bottom-36 right-4 z-40 p-3 bg-ios-blue/80 dark:bg-blue-500/80 text-white rounded-full shadow-lg backdrop-blur-sm hover:bg-ios-blue dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
      aria-label="回到顶部"
    >
      <ChevronUpIcon class="w-5 h-5" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronUpIcon } from '@heroicons/vue/24/outline'

const showButton = ref(false)
let scrollTimeout: number | null = null

const handleScroll = () => {
  if (scrollTimeout) return
  scrollTimeout = window.setTimeout(() => {
    showButton.value = window.pageYOffset > 300
    scrollTimeout = null
  }, 50)
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>
