<script setup lang="ts">
import GlassDropdown from './components/glass/GlassDropdown.vue'
import GlassDropdownMenu from './components/glass/GlassDropdownMenu.vue'
import GlassDropdownItem from './components/glass/GlassDropdownItem.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, MagicStick, Headset, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from './store/auth'
import PlayerBar from './components/PlayerBar.vue'

const route = useRoute(); const router = useRouter(); const auth = useAuthStore()
const publicPage = computed(() => route.meta.public)
const search = ref('')
function searchWorks(){router.push({path:'/library',query:search.value.trim()?{q:search.value.trim()}:{}})}
const adminTestHref = computed(() => router.resolve({ name: 'admin-test' }).href)
const nav = [['/create', '音乐创作', MagicStick], ['/library', '我的作品', Headset]] as const
async function logout(){ await auth.logout(); router.push('/login') }
function unavailable(label: string) { ElMessage.info(`${label}功能即将开放`) }
</script>
<template>
  <router-view v-if="publicPage" />
  <div v-else class="shell unified-shell ui-glass" :class="{ 'ui-studio': route.path === '/create' }">
    <header class="workbench-topbar" data-lg-scene="navigation">
      <router-link class="workbench-brand" to="/create">
        <span class="brand-mark"><i></i><i></i><i></i></span><b>声序</b>
      </router-link>
      <nav class="workbench-nav">
        <router-link v-for="[path, label] in nav" :key="path" :to="path" :class="{active: route.path === path}">{{ label }}</router-link>
        <button class="workbench-nav-placeholder" @click="unavailable('模型广场')">模型广场</button>
        <button class="workbench-nav-placeholder" @click="unavailable('灵感社区')">灵感社区</button>
      </nav>
      <form class="header-search" role="search" @submit.prevent="searchWorks"><el-input v-model="search" aria-label="全局作品搜索" placeholder="搜索作品、风格…" clearable/></form>
      <div class="workbench-actions">
        <router-link class="balance-pill" to="/profile">{{ auth.user?.creditBalance || 0 }} 积分</router-link>
        <button class="header-icon" aria-label="通知" @click="unavailable('通知')"><Bell /><i></i></button>
        <router-link class="user-pill" to="/profile" :aria-label="`打开 ${auth.user?.username || '账户'} 账户`">
          <img v-if="auth.user?.avatarUrl" :src="auth.user.avatarUrl" alt="" />
          <span v-else>{{ auth.user?.username?.slice(0, 1) }}</span>
        </router-link>
        <GlassDropdown trigger="click" popper-class="workbench-more-menu">
          <button class="header-icon" aria-label="更多账户与帮助选项"><MoreFilled /></button>
          <template #dropdown>
            <GlassDropdownMenu>
              <GlassDropdownItem @click="router.push('/profile')">账户与积分</GlassDropdownItem>
              <GlassDropdownItem @click="unavailable('赚额度')">赚额度</GlassDropdownItem>
              <GlassDropdownItem @click="unavailable('充值')">充值</GlassDropdownItem>
              <GlassDropdownItem @click="unavailable('教程')">使用教程</GlassDropdownItem>
              <GlassDropdownItem @click="unavailable('客服')">联系客服</GlassDropdownItem>
              <GlassDropdownItem divided><a :href="adminTestHref" target="_blank" rel="noopener noreferrer">测试管理员</a></GlassDropdownItem>
              <GlassDropdownItem divided @click="logout">退出登录</GlassDropdownItem>
            </GlassDropdownMenu>
          </template>
        </GlassDropdown>
      </div>
    </header>
    <main class="content"><router-view /></main>
    <PlayerBar />
  </div>
</template>
