<template>
  <div id="app" class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <router-view />
    <ToastContainer />
    <UpdateNotification />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import ToastContainer from '@/components/common/ToastContainer.vue'
import UpdateNotification from '@/components/common/UpdateNotification.vue'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.init()
})
</script>
