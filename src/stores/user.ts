import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResponse } from '@/types/api'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<LoginResponse | null>(null)

    const setToken = (newToken: string) => {
      token.value = newToken
      localStorage.setItem('token', newToken)
    }

    const setUserInfo = (info: LoginResponse) => {
      userInfo.value = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    }

    const clearAuth = () => {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }

    const initAuth = () => {
      const savedToken = localStorage.getItem('token')
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedToken) {
        token.value = savedToken
      }
      if (savedUserInfo) {
        try {
          userInfo.value = JSON.parse(savedUserInfo)
        } catch (e) {
          console.error('解析用户信息失败', e)
        }
      }
    }

    const isAdmin = () => {
      return userInfo.value?.roleCode === 'ADMIN' || userInfo.value?.roleId === 1
    }

    const isStock = () => {
      return userInfo.value?.roleCode === 'STOCK' || userInfo.value?.roleId === 2
    }

    const isSales = () => {
      return userInfo.value?.roleCode === 'SALES' || userInfo.value?.roleId === 3
    }

    return {
      token,
      userInfo,
      setToken,
      setUserInfo,
      clearAuth,
      initAuth,
      isAdmin,
      isStock,
      isSales,
    }
  },
  {
    persist: true,
  }
)

