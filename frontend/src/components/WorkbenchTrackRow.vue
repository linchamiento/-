<script setup lang="ts">
import type { Track } from '../types'
import { VideoPlay, VideoPause, Star, Download, MoreFilled, Headset } from '@element-plus/icons-vue'
import { usePlayerStore } from '../store/player'
import GlassDropdown from './glass/GlassDropdown.vue'
import GlassDropdownMenu from './glass/GlassDropdownMenu.vue'
import GlassDropdownItem from './glass/GlassDropdownItem.vue'
defineProps<{ track: Track }>()
defineEmits<{ play: [track: Track]; favorite: [track: Track]; details: [track: Track]; remove: [track: Track] }>()
const player = usePlayerStore()
function duration(value = 0) { return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` }
</script>
<template>
  <article class="workbench-track-row" :class="{ 'is-current': player.track?.id === track.id }">
    <button class="row-main" :disabled="!track.audioUrl" :aria-label="`播放 ${track.title}`" @click="$emit('play', track)">
      <span class="row-cover"><img v-if="track.coverUrl" :src="track.coverUrl" alt="" loading="lazy"/><Headset v-else/></span>
      <span class="row-copy"><strong :title="track.title">{{ track.title || '未命名作品' }}</strong><small>{{track.status === 'SUCCESS' ? '已完成' : track.status === 'FAILED' ? '生成失败' : '创作中'}}</small><span class="row-tags"><span v-for="tag in (track.styleTags || 'AI 音乐').split(/[,，]/).slice(0,3)" :key="tag">{{tag}}</span></span></span>
    </button>
    <span class="row-time">{{duration(track.duration)}}<small>{{new Date(track.createdAt).toLocaleDateString('zh-CN')}}</small></span>
    <span class="row-wave" aria-hidden="true" title="波形示意"><i v-for="n in 40" :key="n" :style="{height: `${4 + (n * 13) % 25}px`}"/></span>
    <div class="row-actions">
      <button :disabled="!track.audioUrl" :aria-label="player.track?.id===track.id&&player.playing?'暂停':'播放'" @click="$emit('play',track)"><VideoPause v-if="player.track?.id===track.id&&player.playing"/><VideoPlay v-else/></button>
      <button :class="{active:player.isFavorite(track)}" :aria-pressed="player.isFavorite(track)" aria-label="收藏作品" @click="$emit('favorite',track)"><Star/></button>
      <a v-if="track.audioUrl" :href="`/api/v1/music-library/${track.id}/download`" aria-label="下载作品"><Download/></a>
      <GlassDropdown trigger="click"><button aria-label="更多作品操作"><MoreFilled/></button><template #dropdown><GlassDropdownMenu><GlassDropdownItem @click="$emit('details',track)">作品详情</GlassDropdownItem><GlassDropdownItem divided @click="$emit('remove',track)">删除作品</GlassDropdownItem></GlassDropdownMenu></template></GlassDropdown>
    </div>
  </article>
</template>
