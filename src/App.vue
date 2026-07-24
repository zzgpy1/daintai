<template>
  <div id="app" class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <TopNavigation />
    <main class="pt-0 desktop:pt-16 pb-24 md:pb-0">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <PlayerBar />
    <BottomNavigation />
    <BackToTopButton />
    <ToastContainer />
    <TopLayerEffects />
    <UpdateDialog
      v-if="showUpdateDialog"
      :update-info="updateInfo"
      @close="showUpdateDialog = false"
      @download="handleDialogDownload"
      @skip="handleDialogSkip"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useToastStore } from '@/stores/toast'
import { UpdateChecker, type UpdateInfo } from '@/services/updateChecker'
import TopNavigation from '@/components/TopNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import TopLayerEffects from '@/components/TopLayerEffects.vue'
import UpdateDialog from '@/components/UpdateDialog.vue'

const themeStore = useThemeStore()
const toastStore = useToastStore()

const showUpdateDialog = ref(false)
const updateInfo = ref<UpdateInfo>({
  hasUpdate: false,
  version: '',
  downloadUrl: '',
  releaseDate: '',
  body: ''
})

const checkUpdate = async () => {
  try {
    const checker = UpdateChecker.getInstance()
    const result = await checker.checkForUpdate()

    if (result.hasUpdate) {
      updateInfo.value = result
      showUpdateDialog.value = true
    }
  } catch (error) {
    console.error('检查更新失败:', error)
  }
}

const handleDialogDownload = () => {
  showUpdateDialog.value = false
  toastStore.showSuccess('正在下载更新...')
}

const handleDialogSkip = () => {
  showUpdateDialog.value = false
}

onMounted(() => {
  themeStore.initTheme()
  setTimeout(() => {
    checkUpdate()
  }, 3000)
})
</script>
