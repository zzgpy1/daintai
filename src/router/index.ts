import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(), // 改用 hash 模式
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue'),
      meta: { title: '搜索' }
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/Favorites.vue'),
      meta: { title: '收藏' }
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/History.vue'),
      meta: { title: '足迹' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { title: '设置' }
    },
    {
      path: '/station/:uuid',
      name: 'StationDetail',
      component: () => import('@/views/StationDetail.vue'),
      meta: { title: '电台详情' }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 全球电台`
  }
  next()
})

export default router
