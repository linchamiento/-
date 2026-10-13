<script setup lang="ts">
import GlassDropdown from './glass/GlassDropdown.vue'
import GlassDropdownMenu from './glass/GlassDropdownMenu.vue'
import GlassDropdownItem from './glass/GlassDropdownItem.vue'
import type { Track } from '../types'
import { VideoPlay, MoreFilled, Headset } from '@element-plus/icons-vue'
import { usePlayerStore } from '../store/player'
defineProps<{ track: Track }>()
defineEmits<{ details: [track: Track]; remove: [track: Track] }>()
const player = usePlayerStore()
</script>
<template><article class="track-card" data-lg-scene="track"><div class="cover"><img v-if="track.coverUrl" :src="track.coverUrl"/><div v-else class="cover-fallback"><el-icon><Headset/></el-icon><span></span></div><button v-if="track.audioUrl" class="cover-play" aria-label="播放" @click="player.play(track)"><el-icon><VideoPlay/></el-icon></button><span class="track-status" :class="track.status.toLowerCase()">{{track.status==='SUCCESS'?'已完成':track.status==='FAILED'?'失败':'生成中'}}</span></div><div class="track-meta"><div><strong>{{track.title||'正在命名…'}}</strong><small>{{track.styleTags||'AI 音乐创作'}}</small></div><GlassDropdown trigger="click"><button class="ghost"><el-icon><MoreFilled/></el-icon></button><template #dropdown><GlassDropdownMenu><GlassDropdownItem @click="$emit('details',track)">查看详情</GlassDropdownItem><GlassDropdownItem v-if="track.audioUrl"><a :href="`/api/v1/music-library/${track.id}/download`">下载音乐</a></GlassDropdownItem><GlassDropdownItem divided @click="$emit('remove',track)">删除作品</GlassDropdownItem></GlassDropdownMenu></template></GlassDropdown></div></article></template>
