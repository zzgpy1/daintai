<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-dark-card rounded-xl max-w-sm w-full p-6 shadow-xl">
      <h3 class="text-lg font-semibold text-ios-dark-gray dark:text-dark-text text-center">{{ t('share.title') }}</h3>
      <p class="text-sm text-ios-gray dark:text-dark-secondary text-center mt-2">{{ station?.name }}</p>
      <button @click="copyLink" class="w-full flex items-center justify-center gap-3 p-4 mt-4 bg-ios-blue text-white rounded-lg hover:bg-blue-600 transition-colors">
        <DocumentDuplicateIcon class="w-5 h-5" />
        <span>{{ t('share.copyLink') }}</span>
      </button>
      <button @click="$emit('close')" class="w-full mt-4 p-3 border border-gray-200 dark:border-dark-gray rounded-lg text-ios-gray hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors">
        {{ t('common.close') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import type { RadioStation } from '@/types/radio'
import { DocumentDuplicateIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ visible: boolean; station: RadioStation | null }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useLanguageStore()

const copyLink = async () => {
  if (!props.station) return
  const url = `${window.location.origin}/station/${props.station.stationuuid}`
  await navigator.clipboard.writeText(url)
}
</script>
