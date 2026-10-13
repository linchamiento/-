<script setup lang="ts">
import GlassSlider from './glass/GlassSlider.vue'
import GlassDropdown from './glass/GlassDropdown.vue'
import GlassDropdownMenu from './glass/GlassDropdownMenu.vue'
import GlassDropdownItem from './glass/GlassDropdownItem.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import {
  ChatDotRound,
  Close,
  DArrowLeft,
  DArrowRight,
  Download,
  Headset,
  InfoFilled,
  Menu,
  MoreFilled,
  Mute,
  Share,
  Star,
  VideoPause,
  VideoPlay,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../store/player'
import { useAuthStore } from '../store/auth'
import { api } from '../api'
import QueuePanel from './QueuePanel.vue'
import CommentPanel from './CommentPanel.vue'
import ShareDialog from './ShareDialog.vue'
import TrackInfoPanel from './TrackInfoPanel.vue'

type LyricLine = { text: string; start?: number; section?: boolean }
type MoreAction = 'share' | 'comments' | 'info' | 'remove' | 'clear'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const player = usePlayerStore()
const auth = useAuthStore()
const lyricRefs = ref<HTMLElement[]>([])
const lyricsContainer = ref<HTMLElement | null>(null)
const moreOpen = ref(false)
const volumeOpen = ref(false)
const queueOpen = ref(false)
const commentsOpen = ref(false)
const shareOpen = ref(false)
const infoOpen = ref(false)
const reducedMotion = ref(false)

const track = computed(() => player.track)
const duration = computed(() => player.duration || track.value?.duration || 0)
const isFavorite = computed(() => track.value ? player.isFavorite(track.value) : false)
const creditLabel = computed(() => {
  const source = track.value?.sourceType?.trim()
  return !source || /^(generated|generate|ai)$/i.test(source) ? 'AI生成' : source
})

function parseTimestamp(value: string) {
  const match = value.match(/^(\d+):(\d{2})(?:[.:](\d+))?$/)
  if (!match) return null
  const minutes = Number(match[1])
  const seconds = Number(match[2])
  const fraction = match[3] ? Number(`0.${match[3]}`) : 0
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || !Number.isFinite(fraction)) return null
  return minutes * 60 + seconds + fraction
}

function isSectionText(value: string) {
  return /^\[(?:intro|verse|pre[- ]?chorus|chorus|bridge|hook|refrain|outro|instrumental)\]$/i.test(value.trim())
}

function parseLyrics(value: string): LyricLine[] {
  const rows = value.split(/\r?\n/).map(row => row.trim()).filter(Boolean)
  const parsed: LyricLine[] = []
  let hasTimestamp = false
  for (const row of rows) {
    const matches = [...row.matchAll(/\[([0-9]{1,3}:[0-9]{2}(?:[.:][0-9]{1,3})?)\]/g)]
    const text = row.replace(/\[[0-9]{1,3}:[0-9]{2}(?:[.:][0-9]{1,3})?\]/g, '').trim()
    if (!text) continue
    const section = !matches.length && isSectionText(text)
    if (matches.length) {
      hasTimestamp = true
      for (const match of matches) {
        const start = parseTimestamp(match[1]!)
        if (start != null) parsed.push({ text, start, section })
      }
    } else {
      parsed.push({ text, section })
    }
  }
  if (!hasTimestamp) return parsed.map((line, index) => ({ ...line, start: duration.value ? (duration.value * index) / parsed.length : undefined }))
  return parsed.sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
}

const lines = computed(() => parseLyrics(track.value?.lyrics || ''))
const activeIndex = computed(() => {
  if (!lines.value.length) return -1
  let active = 0
  for (let index = 0; index < lines.value.length; index += 1) {
    if ((lines.value[index]!.start ?? 0) <= player.current) active = index
    else break
  }
  return active
})

function setLyricRef(element: Element | ComponentPublicInstance | null, index: number) {
  if (element instanceof HTMLElement) lyricRefs.value[index] = element
}

function formatTime(value: number) {
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`
}

function close() {
  moreOpen.value = false
  volumeOpen.value = false
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    if (moreOpen.value || volumeOpen.value) {
      moreOpen.value = false
      volumeOpen.value = false
      return
    }
    close()
  }
}

function seek(value: number | string) { player.seek(Number(value)) }
function setVolume(value: number | string) { player.setVolume(Number(value)) }
function nextTrack() { player.next() }
function download() { if (track.value) window.open(`/api/v1/music-library/${track.value.id}/download`, '_blank') }

async function favorite() {
  if (!track.value) return
  if (!auth.user) { ElMessage.info('登录后可以收藏作品'); return }
  const next = !isFavorite.value
  try {
    const updated = await api.favoriteTrack(track.value.id, next)
    player.syncFavorite(track.value.id, !!updated.favorite)
    ElMessage.success(next ? '已收藏' : '已取消收藏')
  } catch { /* http interceptor displays the error */ }
}

function moreAction(action: string) {
  moreOpen.value = false
  if (action === 'share') shareOpen.value = true
  if (action === 'comments') commentsOpen.value = true
  if (action === 'info') infoOpen.value = true
  if (action === 'remove' && track.value) player.removeFromQueue(track.value.id)
  if (action === 'clear') { player.clearQueue(); close() }
}

function scrollActiveLyric(index: number) {
  const container = lyricsContainer.value
  const element = lyricRefs.value[index]
  if (!container || !element) return
  const target = element.offsetTop - (container.clientHeight - element.offsetHeight) / 2
  container.scrollTo({ top: Math.max(0, target), behavior: reducedMotion.value ? 'auto' : 'smooth' })
}

watch(() => [props.open, track.value?.id, activeIndex.value] as const, async ([open, , index]) => {
  if (!open || index < 0) return
  await nextTick()
  scrollActiveLyric(index)
}, { immediate: true })

watch(() => track.value?.id, () => { lyricRefs.value = [] })
watch(() => [props.open, track.value?.id] as const, ([open, id]) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open && id ? 'hidden' : ''
  if (!open || !id) {
    moreOpen.value = false
    volumeOpen.value = false
  }
}, { immediate: true })

onMounted(() => {
  reducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="props.open && track" class="now-playing-overlay" role="presentation" @click.self="close">
    <section class="now-playing-panel" role="dialog" aria-modal="true" aria-label="正在播放" @click.stop>
      <header class="now-playing-header">
        <button class="now-playing-collapse" aria-label="收起正在播放" @click="close">⌄</button>
        <span class="eyebrow">NOW PLAYING</span>
        <button class="now-playing-close" aria-label="关闭正在播放" @click="close"><Close /></button>
      </header>

      <div class="now-playing-body">
        <div class="now-playing-art-column">
          <div class="now-playing-cover-frame">
            <div class="now-playing-cover">
              <img v-if="track.coverUrl" :src="track.coverUrl" :alt="`${track.title} 封面`" />
              <Headset v-else aria-hidden="true" />
            </div>
          </div>
          <div class="now-playing-art-copy">
            <h1>{{ track.title || '未命名作品' }}</h1>
            <p>{{ track.styleTags || 'AI 音乐作品' }}</p>
          </div>
          <div class="now-playing-art-actions" aria-label="歌曲操作">
            <button class="now-playing-action" :class="{active:isFavorite}" :aria-label="isFavorite ? '取消收藏' : '收藏当前作品'" @click="favorite"><Star /></button>
            <button class="now-playing-action" aria-label="下载音频" @click="download"><Download /></button>
            <button class="now-playing-action" aria-label="分享作品" @click="shareOpen=true"><Share /></button>
            <GlassDropdown @command="moreAction" @visible-change="moreOpen=$event">
              <button class="now-playing-action" aria-label="更多操作"><MoreFilled /></button>
              <template #dropdown><GlassDropdownMenu>
                <GlassDropdownItem command="comments"><ChatDotRound />评论</GlassDropdownItem>
                <GlassDropdownItem command="info"><InfoFilled />作品信息</GlassDropdownItem>
                <GlassDropdownItem command="share"><Share />分享作品</GlassDropdownItem>
                <GlassDropdownItem command="remove">从队列移除</GlassDropdownItem>
                <GlassDropdownItem command="clear">清空播放队列</GlassDropdownItem>
              </GlassDropdownMenu></template>
            </GlassDropdown>
          </div>
        </div>

        <div class="now-playing-lyrics-column">
          <div class="now-playing-lyrics-heading">
            <div class="now-playing-title-row">
              <h2>{{ track.title || '未命名作品' }}</h2>
              <span class="now-playing-ai-tag">AI 生成</span>
            </div>
            <p>词 / 曲：{{ creditLabel }}</p>
          </div>
          <div v-if="!lines.length" class="now-playing-empty-lyrics">这首作品没有歌词。</div>
          <div v-else ref="lyricsContainer" class="now-playing-lyrics" aria-live="polite">
            <p v-for="(line, index) in lines" :key="`${index}-${line.start ?? 'plain'}`" :ref="element => setLyricRef(element, index)" :class="{active:index===activeIndex, past:index<activeIndex, section:line.section}">{{ line.text }}</p>
          </div>
        </div>
      </div>

      <footer class="now-playing-footer">
        <div class="now-playing-trackline">
          <span>{{ formatTime(player.current) }}</span>
          <GlassSlider aria-label="播放进度" :model-value="player.current" :max="duration || 1" :step="1" :show-tooltip="false" @input="seek" />
          <span>{{ formatTime(duration) }}</span>
        </div>
        <div class="now-playing-footer-row">
          <div class="now-playing-footer-meta"><span>{{ track.modelVersion || 'suno-v6' }}</span><span>{{ track.sourceType || 'GENERATED' }}</span></div>
          <div class="now-playing-controls">
            <button class="now-playing-control" aria-label="上一首" :disabled="!track" @click="player.previous"><DArrowLeft /></button>
            <button class="now-playing-main-control" aria-label="播放或暂停" :disabled="!track" @click="player.toggle"><VideoPause v-if="player.playing" /><VideoPlay v-else /></button>
            <button class="now-playing-control" aria-label="下一首" :disabled="!track" @click="nextTrack"><DArrowRight /></button>
          </div>
          <div class="now-playing-utilities">
            <button class="now-playing-control" aria-label="播放队列" @click="queueOpen=true"><Menu /></button>
            <button class="now-playing-control" aria-label="打开评论" @click="commentsOpen=true"><ChatDotRound /></button>
            <div class="now-playing-volume-wrap">
              <button class="now-playing-control" aria-label="静音或恢复音量" :aria-expanded="volumeOpen" @click="volumeOpen=!volumeOpen"><Mute /></button>
              <div v-if="volumeOpen" class="now-playing-volume-popover">
                <GlassSlider :model-value="player.muted ? 0 : player.volume" :min="0" :max="1" :step=".01" :show-tooltip="false" @input="setVolume" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </section>
    <QueuePanel :open="queueOpen" @close="queueOpen=false" />
    <CommentPanel :open="commentsOpen" :track="track" @close="commentsOpen=false" />
    <ShareDialog :open="shareOpen" :track="track" @close="shareOpen=false" />
    <TrackInfoPanel :open="infoOpen" :track="track" @close="infoOpen=false" />
  </div>
</template>
