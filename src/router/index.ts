import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/index.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard/index.vue'),
          meta: { title: '首页', roles: ['ADMIN', 'STOCK', 'SALES'] },
        },
        // 管理员功能
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/User/index.vue'),
          meta: { title: '用户管理', roles: ['ADMIN'] },
        },
        {
          path: 'product-type',
          name: 'ProductType',
          component: () => import('@/views/ProductType/index.vue'),
          meta: { title: '产品类型管理', roles: ['ADMIN'] },
        },
        {
          path: 'product',
          name: 'Product',
          component: () => import('@/views/Product/index.vue'),
          meta: { title: '产品管理', roles: ['ADMIN'] },
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/Statistics/index.vue'),
          meta: { title: '统计管理', roles: ['ADMIN'] },
        },
        // 库存人员功能
        {
          path: 'stock-in',
          name: 'StockIn',
          component: () => import('@/views/StockIn/index.vue'),
          meta: { title: '入库管理', roles: ['STOCK'] },
        },
        {
          path: 'stock-out',
          name: 'StockOut',
          component: () => import('@/views/StockOut/index.vue'),
          meta: { title: '出库管理', roles: ['STOCK'] },
        },
        {
          path: 'product-query',
          name: 'ProductQuery',
          component: () => import('@/views/ProductQuery/index.vue'),
          meta: { title: '产品查询', roles: ['STOCK', 'SALES'] },
        },
        // 销售人员功能
        {
          path: 'sale',
          name: 'Sale',
          component: () => import('@/views/Sale/index.vue'),
          meta: { title: '销售管理', roles: ['SALES'] },
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  userStore.initAuth()

  // 如果访问登录页
  if (to.path === '/login') {
    // 如果是从其他页面跳转过来的（可能是token过期），清除token
    if (from.path !== '/' && from.path !== '/login' && from.path !== '' && userStore.token) {
      // 从其他页面跳转过来，可能是token过期导致的跳转，清除token
      userStore.clearAuth()
    }
    // 允许访问登录页，不自动跳转
    // 如果token有效，用户登录时会提示或直接进入系统
    next()
    return
  }

  // 需要认证的页面
  if (to.meta.requiresAuth) {
    if (!userStore.token) {
      // 没有token，跳转到登录页
      next({ path: '/login', replace: true })
      return
    }

    // 角色权限检查
    if (to.meta.roles) {
      const userRole = userStore.userInfo?.roleCode
      const allowedRoles = to.meta.roles as string[]
      if (!userRole || !allowedRoles.includes(userRole)) {
        ElMessage.warning('您没有权限访问此页面')
        next({ path: '/dashboard', replace: true })
        return
      }
    }
  }

  next()
})

export default router
