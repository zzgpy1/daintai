<template>
  <div class="not-found-page flex flex-col items-center justify-center min-h-[60vh] px-4">
    <div class="text-center">
      <div class="w-32 h-32 mx-auto mb-6">
        <img src="/icon-512x512.png" alt="GlobalRadio" class="w-full h-full object-contain" />
      </div>
      <h1 class="text-6xl font-bold text-ios-dark-gray dark:text-dark-text mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-ios-gray dark:text-dark-secondary mb-4">
        {{ $t('common.notFound') }}
      </h2>
      <p class="text-ios-gray dark:text-dark-secondary mb-8">
        抱歉，您访问的页面不存在
      </p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-ios-blue text-white rounded-ios font-medium hover:bg-blue-600 transition-colors"
      >
        <HomeIcon class="w-5 h-5" />
        {{ $t('common.back') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon } from '@heroicons/vue/24/outline'
</script>
