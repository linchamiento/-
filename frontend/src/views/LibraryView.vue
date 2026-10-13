<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { api } from '../api'
import type { Track } from '../types'
import TrackCard from '../components/TrackCard.vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
const items = ref<Track[]>([]), q = ref(''), page = ref(1), total = ref(0)
const detail = ref<Track | null>(null), loading = ref(false)
let debounce: number
async function load() {
  loading.value = true
  try {
    const result = await api.library(q.value, page.value)
    items.value = result.items
    total.value = result.total
  } finally { loading.value = false }
}
watch(q, () => {
  clearTimeout(debounce)
  debounce = window.setTimeout(() => { page.value = 1; void load() }, 300)
})
async function remove(track: Track) {
  await ElMessageBox.confirm(`确定删除《${track.title}》吗？`, '删除作品', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
  await api.deleteTrack(track.id)
  await load()
}
onMounted(load)
</script>
<template><div class="page library-page"><header class="page-title inline"><div><span class="eyebrow">YOUR ARCHIVE</span><h1>我的音乐库</h1><p>收藏每一次灵感落地的声音。</p></div><el-input v-model="q" class="search" placeholder="搜索作品标题" clearable><template #prefix><el-icon><Search/></el-icon></template></el-input></header><div v-loading="loading" class="track-grid library-grid"><TrackCard v-for="t in items" :key="t.id" :track="t" @details="detail=$event" @remove="remove"/><div v-if="!loading&&!items.length" class="empty-library"><span>♪</span><h3>{{q?'没有找到相关作品':'音乐库还是空的'}}</h3><p>{{q?'换一个标题试试。':'完成第一次创作后，作品会出现在这里。'}}</p><router-link v-if="!q" to="/create">开始创作</router-link></div></div><el-pagination v-if="total>12" v-model:current-page="page" layout="prev, pager, next" :page-size="12" :total="total" @change="load"/><el-drawer v-model="detail" size="min(460px, 92vw)" title="作品详情"><template v-if="detail"><div class="detail-cover"><img v-if="detail.coverUrl" :src="detail.coverUrl"/><span v-else>♪</span></div><h2>{{detail.title}}</h2><p class="tags">{{detail.styleTags||'暂无风格信息'}}</p><dl><div><dt>模型</dt><dd>{{detail.modelVersion||'—'}}</dd></div><div><dt>时长</dt><dd>{{detail.duration?`${Math.round(detail.duration)} 秒`:'—'}}</dd></div><div><dt>创建时间</dt><dd>{{new Date(detail.createdAt).toLocaleString()}}</dd></div></dl><h3>歌词</h3><pre>{{detail.lyrics||'这首作品没有歌词。'}}</pre></template></el-drawer></div></template>
