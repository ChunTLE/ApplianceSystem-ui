<template>
    <el-container class="layout-container">
        <!-- 侧边栏 -->
        <el-aside width="200px" class="sidebar">
            <div class="logo">
                <h2>家电库存系统</h2>
            </div>
            <el-menu :default-active="activeMenu" router class="sidebar-menu" background-color="#304156"
                text-color="#bfcbd9" active-text-color="#409EFF">
                <el-menu-item index="/dashboard">
                    <span>首页</span>
                </el-menu-item>
                
                <!-- 管理员菜单 -->
                <template v-if="userStore.isAdmin()">
                    <el-menu-item index="/user">
                        <span>用户管理</span>
                    </el-menu-item>
                    <el-menu-item index="/product-type">
                        <span>产品类型管理</span>
                    </el-menu-item>
                    <el-menu-item index="/product">
                        <span>产品管理</span>
                    </el-menu-item>
                    <el-menu-item index="/statistics">
                        <span>统计管理</span>
                    </el-menu-item>
                </template>
                
                <!-- 库存人员菜单 -->
                <template v-if="userStore.isStock()">
                    <el-menu-item index="/stock-in">
                        <span>入库管理</span>
                    </el-menu-item>
                    <el-menu-item index="/stock-out">
                        <span>出库管理</span>
                    </el-menu-item>
                    <el-menu-item index="/product-query">
                        <span>产品查询</span>
                    </el-menu-item>
                </template>
                
                <!-- 销售人员菜单 -->
                <template v-if="userStore.isSales()">
                    <el-menu-item index="/sale">
                        <span>销售管理</span>
                    </el-menu-item>
                    <el-menu-item index="/product-query">
                        <span>产品查询</span>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-container>
            <el-header class="header">
                <div class="header-left">
                    <span>{{ currentTitle }}</span>
                </div>
                <div class="header-right">
                    <span>欢迎，{{ userStore.userInfo?.username }}</span>
                    <span style="margin: 0 10px;">|</span>
                    <span>{{ userStore.userInfo?.roleName }}</span>
                    <el-button type="text" @click="handleLogout" style="margin-left: 20px;">退出</el-button>
                </div>
            </el-header>
            <el-main class="main-content">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
    userStore.initAuth()
})

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => {
    const matched = route.matched.find((item) => item.meta?.title)
    return matched?.meta?.title || '家电库存系统'
})

const handleLogout = async () => {
    try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        userStore.clearAuth()
        router.push('/login')
    } catch {
        // 用户取消
    }
}
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.sidebar {
    background-color: #304156;
    overflow: hidden;
}

.logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    background-color: #2b3a4a;
    color: #fff;
}

.logo h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
}

.sidebar-menu {
    border: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
}

.header {
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.header-left {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
}

.header-right {
    display: flex;
    align-items: center;
    color: #606266;
}

.main-content {
    background-color: #f0f2f5;
    padding: 20px;
}
</style>
