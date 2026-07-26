import { createRouter, createWebHistory } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: {
        title: '首页',
        keepAlive: true
      }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue'),
      meta: {
        title: '搜索',
        keepAlive: true
      }
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/History.vue'),
      meta: {
        title: '足迹',
        keepAlive: true
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: {
        title: '设置'
      }
    },
    {
      path: '/station/:uuid',
      name: 'StationDetail',
      component: () => import('@/views/StationDetail.vue'),
      meta: {
        title: '电台详情'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: '页面未找到'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const settingsStore = useSettingsStore()
  const lang = settingsStore.language
  const titles: Record<string, string> = {
    'zh': '全球电台',
    'en': 'Global Radio',
    'es': 'Radio Global',
    'fr': 'Radio Mondiale',
    'de': 'Globales Radio',
    'ja': 'グローバルラジオ',
    'ko': '글로벌 라디오',
    'ru': 'Глобальное радио',
    'ar': 'راديو عالمي',
    'pt': 'Rádio Global'
  }
  
  const appName = titles[lang] || 'Global Radio'
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${appName}`
  } else {
    document.title = appName
  }
  
  next()
})

export default router
