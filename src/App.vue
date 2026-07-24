<template>
  <div id="app" class="min-h-screen bg-ios-light-gray dark:bg-dark-bg">
    <!-- 顶部导航（桌面端） -->
    <TopNavigation />
    
    <!-- 主内容区域 -->
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

    <!-- 底部播放栏 -->
    <PlayerBar />
    
    <!-- 底部导航（移动端） -->
    <BottomNavigation />
    
    <!-- 回到顶部按钮 -->
    <BackToTopButton />
    
    <!-- Toast 通知容器 -->
    <ToastContainer />
    
    <!-- 顶部装饰层 -->
    <TopLayerEffects />

    <!-- ============================================ -->
    <!-- 更新弹窗 -->
    <!-- ============================================ -->
    <UpdateDialog
      v-if="showUpdateDialog"
      :update-info="updateInfo"
      @close="showUpdateDialog = false"
      @download="handleDownload"
      @skip="handleSkip"
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

// 更新相关状态
const showUpdateDialog = ref(false)
const updateInfo = ref<UpdateInfo>({
  hasUpdate: false,
  version: '',
  downloadUrl: '',
  releaseDate: '',
  body: ''
})

// 检查更新
const checkUpdate = async () => {
  try {
    // 检查是否跳过了此版本
    const skippedVersion = localStorage.getItem('skipped_version')
    const checker = UpdateChecker.getInstance()
    const result = await checker.checkForUpdate()

    if (result.hasUpdate && result.version !== skippedVersion) {
      updateInfo.value = result
      showUpdateDialog.value = true
    }
  } catch (error) {
    console.error('检查更新失败:', error)
  }
}

const handleDownload = () => {
  showUpdateDialog.value = false
  toastStore.showSuccess('正在下载更新，请稍候...')
}

const handleSkip = () => {
  showUpdateDialog.value = false
}

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()

  // APP 启动后延迟 2 秒检查更新
  setTimeout(() => {
    checkUpdate()
  }, 2000)
})
</script>

<style>
/* 全局样式在 style.css 中定义 */
</style>
