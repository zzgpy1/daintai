<template>
  <Transition>
    <button v-if="showButton" @click="scrollToTop" class="fixed bottom-36 right-4 z-40 p-3 bg-ios-blue/80 text-white rounded-full shadow-lg backdrop-blur-sm hover:bg-ios-blue transition-all">
      <ChevronUpIcon class="w-6 h-6" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronUpIcon } from '@heroicons/vue/24/outline'

const showButton = ref(false)

const checkScroll = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', checkScroll))
onUnmounted(() => window.removeEventListener('scroll', checkScroll))
</script>
