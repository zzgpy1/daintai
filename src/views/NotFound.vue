<template>
  <div class="not-found-page flex flex-col items-center justify-center min-h-[60vh] px-4">
    <div class="text-center">
      <div class="text-8xl font-bold text-ios-gray dark:text-dark-secondary mb-4">404</div>
      <h1 class="text-2xl font-bold text-ios-dark-gray dark:text-dark-text mb-2">
        页面未找到
      </h1>
      <p class="text-ios-gray dark:text-dark-secondary mb-6">
        您访问的页面不存在或已被移除
      </p>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-ios-blue text-white rounded-ios font-medium hover:bg-blue-600 transition-colors"
      >
        返回首页
      </router-link>
    </div>
  </div>
</template>
