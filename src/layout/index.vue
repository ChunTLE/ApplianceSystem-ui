<template>
    <el-container class="layout-container">
        <!-- 侧边栏 -->
        <el-aside width="200px" class="sidebar">
            <div class="logo">
                <h2>家电库存系统</h2>
            </div>
            <el-menu :default-active="activeMenu" router class="sidebar-menu" background-color="#304156"
                text-color="#bfcbd9" active-text-color="#409EFF">
                <el-menu-item index="/product">
                    <span>产品管理</span>
                </el-menu-item>
                <el-menu-item index="/sale">
                    <span>销售管理</span>
                </el-menu-item>
                <el-menu-item index="/stock">
                    <span>库存管理</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-container>
            <el-header class="header">
                <div class="header-title">
                    <span>{{ currentTitle }}</span>
                </div>
            </el-header>
            <el-main class="main-content">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => {
    const matched = route.matched.find((item) => item.meta?.title)
    return matched?.meta?.title || '家电库存系统'
})
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
    padding: 0 20px;
}

.header-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
}

.main-content {
    background-color: #f0f2f5;
    padding: 20px;
}
</style>
