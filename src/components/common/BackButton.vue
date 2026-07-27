<template>
  <button
    v-if="show"
    @click="goBack"
    class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
    :title="$t('common.back')"
  >
    <ArrowLeftIcon class="w-5 h-5 text-ios-gray dark:text-dark-secondary" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const show = computed(() => route.path !== '/')

const goBack = () => {
  router.push('/')
}
</script>
