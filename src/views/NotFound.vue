<template>
  <div class="not-found-page flex flex-col items-center justify-center min-h-[60vh] px-4">
    <div class="text-center">
      <!-- 使用内联 SVG 图标代替图片 -->
      <div class="w-32 h-32 mx-auto mb-6">
        <svg class="w-full h-full" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="256" cy="256" r="240" fill="url(#gradient)" stroke="#3B82F6" stroke-width="4"/>
          <path d="M256 120 L320 200 L256 280 L192 200 L256 120Z" fill="white" opacity="0.9"/>
          <path d="M200 200 L320 200 L320 280 L200 280 L200 200Z" fill="white" opacity="0.7"/>
          <path d="M200 280 L256 360 L312 280 L200 280Z" fill="white" opacity="0.5"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3B82F6"/>
              <stop offset="50%" stop-color="#8B5CF6"/>
              <stop offset="100%" stop-color="#EC4899"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="text-6xl font-bold text-ios-dark-gray dark:text-dark-text mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-ios-gray dark:text-dark-secondary mb-4">
        页面未找到
      </h2>
      <p class="text-ios-gray dark:text-dark-secondary mb-8">
        抱歉，您访问的页面不存在
      </p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-ios-blue text-white rounded-ios font-medium hover:bg-blue-600 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/>
        </svg>
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无逻辑，纯展示组件
</script>

<style scoped>
.not-found-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
