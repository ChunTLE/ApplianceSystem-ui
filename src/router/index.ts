import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/product',
      children: [
        {
          path: 'product',
          name: 'Product',
          component: () => import('@/views/Product/index.vue'),
          meta: { title: '产品管理', icon: 'Goods' },
        },
        {
          path: 'sale',
          name: 'Sale',
          component: () => import('@/views/Sale/index.vue'),
          meta: { title: '销售管理', icon: 'ShoppingCart' },
        },
        {
          path: 'stock',
          name: 'Stock',
          component: () => import('@/views/Stock/index.vue'),
          meta: { title: '库存管理', icon: 'Box' },
        },
      ],
    },
  ],
})

export default router
