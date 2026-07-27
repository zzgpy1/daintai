<template>
  <div class="min-h-screen bg-ios-light-gray dark:bg-dark-bg pb-24">
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-gray px-4 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <BackButton />
          <h1 class="text-xl font-bold text-ios-dark-gray dark:text-dark-text">{{ $t('history.title') }}</h1>
        </div>
        <button v-if="history.length > 0" @click="clearAll" class="text-ios-red text-sm hover:underline">
          {{ $t('history.clearAll') }}
        </button>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <div v-if="history.length === 0" class="text-center py-16">
        <ClockIcon class="w-16 h-16 text-ios-light-gray dark:text-dark-secondary mx-auto mb-4" />
        <h3 class="text-lg font-medium text-ios-dark-gray dark:text-dark-text">{{ $t('history.empty') }}</h3>
        <p class="text-ios-gray dark:text-dark-secondary mt-2">{{ $t('history.emptyHint') }}</p>
        <router-link to="/" class="inline-block mt-4 px-6 py-2 bg-ios-blue text-white rounded-ios hover:bg-blue-600">
          {{ $t('home.title') }}
        </router-link>
      </div>

      <div v-else>
        <div v-for="group in groupedHistory" :key="group.date" class="mb-6">
          <h3 class="text-sm font-semibold text-ios-gray dark:text-dark-secondary mb-3">{{ group.date }}</h3>
          <div class="space-y-3">
            <StationCard
              v-for="item in group.items"
              :key="item.timestamp"
              :station="item.station"
              :history-timestamp="item.timestamp"
              @remove="removeItem"
            />
          </div>
        </div>
      </div>
    </div>

    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useToastStore } from '@/stores/toast'
import BackButton from '@/components/common/BackButton.vue'
import StationCard from '@/components/common/StationCard.vue'
import PlayerBar from '@/components/common/PlayerBar.vue'
import { ClockIcon } from '@heroicons/vue/24/outline'

const historyStore = useHistoryStore()
const toastStore = useToastStore()

const history = computed(() => historyStore.history)

const groupedHistory = computed(() => {
  const groups: { date: string; items: any[] }[] = []
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const item of history.value) {
    const date = new Date(item.timestamp)
    let label = date.toLocaleDateString('zh-CN')
    
    if (date.toDateString() === today.toDateString()) {
      label = '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = '昨天'
    }

    const existing = groups.find(g => g.date === label)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ date: label, items: [item] })
    }
  }

  return groups
})

const removeItem = (timestamp: number) => {
  historyStore.removeFromHistory(timestamp)
  toastStore.showInfo('已移除记录')
}

const clearAll = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    historyStore.clearHistory()
    toastStore.showInfo('已清空历史记录')
  }
}
</script>
