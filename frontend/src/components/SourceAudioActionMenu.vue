<script setup lang="ts">
import GlassDropdown from './glass/GlassDropdown.vue'
import GlassDropdownMenu from './glass/GlassDropdownMenu.vue'
import GlassDropdownItem from './glass/GlassDropdownItem.vue'
import { ref } from 'vue'
import { ArrowDown, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits<{ command: [command: string] }>()
const open = ref(false)

const sections = [
  { title: '重混融合', items: [
    { command: 'remix', title: '翻唱', description: '用不同的曲风或情绪重新演绎该歌曲' },
    { command: 'mashup', title: '融合', description: '与选取的另一首歌曲进行融合混音' },
    { command: 'sample', title: '采样', description: '截取原音频的一个片段融入新曲中' },
    { command: 'inspo', title: '灵感', description: '借鉴其音乐氛围与旋律感，非直接复用' }
  ] },
  { title: '音频编辑', items: [
    { command: 'extend', title: '续写', description: '从歌曲指定时间点向后继续生成' },
    { command: 'crop', title: '裁剪', description: '保留选中的核心片段，裁剪掉多余部分' },
    { command: 'remove', title: '删除', description: '从歌曲中间删除指定的一段' },
    { command: 'reverse', title: '倒放', description: '将音频反向倒序播放' },
    { command: 'speed', title: '变速', description: '调整音频播放倍速与节拍速度' },
    { command: 'arrange', title: '编曲', description: '添加、修改或替换歌曲的伴奏乐器' },
    { command: 'vocal', title: '人声', description: '添加、调整或替换歌曲的主唱与和声' },
    { command: 'replace', title: '替换', description: '重新生成并替换歌曲中指定的一段' },
    { command: 'fadein', title: '淡入', description: '片头音量渐强，平滑入场' },
    { command: 'fadeout', title: '淡出', description: '片尾音量渐弱，平滑收尾' },
    { command: 'addtrack', title: '加轨', description: '叠加独立的乐器或人声新音轨' },
    { command: 'stems', title: '分轨', description: '把人声和伴奏分离' }
  ] }
]

// All actions share the same outline, size and stroke weight.
const iconPaths: Record<string, string[]> = {
  remix: ['M4 16V5h10M4 5l-3 3m3-3 3 3', 'M20 8v11H10m10 0-3-3m3 3 3-3'],
  mashup: ['M9 7H7a5 5 0 0 0 0 10h2m6-10h2a5 5 0 0 1 0 10h-2M8 12h8'],
  sample: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 9l1-2m10 10 1-2'],
  inspo: ['m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z', 'M20 2v4m-2-2h4'],
  extend: ['M3 12h13m-5-5 5 5-5 5M21 4v16'],
  crop: ['M6 2v16h16M2 6h16v16'],
  remove: ['M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M8.5 6.5 21 21M8.5 17.5 21 3'],
  reverse: ['M10 4 4 10l6 6M4 10h10a6 6 0 0 1 0 12'],
  speed: ['M4 19a10 10 0 1 1 16 0M12 12l5-5M7 19h10'],
  arrange: ['M9 18V5l11-2v13M9 8l11-2', 'M9 18c0 2-2 3-4 3s-3-1-3-2 2-3 4-3h3m11 0c0 2-2 3-4 3s-3-1-3-2 2-3 4-3h3'],
  vocal: ['M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Z', 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8'],
  replace: ['M4 8h16m-4-4 4 4-4 4M20 16H4m4 4-4-4 4-4'],
  fadein: ['M3 20h18M4 16l16-12M4 16V9m5 3V7m5 1V5'],
  fadeout: ['M3 20h18M4 4l16 12M20 16V9m-5 3V7m-5 1V5'],
  addtrack: ['M3 6h11M3 12h8M3 18h8M17 10v10m-5-5h10'],
  stems: ['M4 7h6l4-3h6M4 12h16M4 17h6l4 3h6']
}
</script>

<template>
  <GlassDropdown
    class="source-audio-actions"
    trigger="click"
    placement="bottom-start"
    popper-class="source-audio-action-popper"
    :show-arrow="false"
    @visible-change="open = $event"
    @command="emit('command', $event)"
  >
    <button type="button" class="source-audio-action-trigger" :class="{ 'is-open': open }" aria-label="音频操作：翻唱" :aria-expanded="open">
      <Refresh aria-hidden="true" />
      <span>翻唱</span>
      <ArrowDown class="source-audio-action-chevron" aria-hidden="true" />
    </button>
    <template #dropdown>
      <GlassDropdownMenu class="source-audio-action-list" aria-label="音频操作">
        <template v-for="section in sections" :key="section.title">
          <li class="source-audio-action-heading" role="presentation">{{ section.title }}</li>
          <GlassDropdownItem v-for="item in section.items" :key="item.command" :command="item.command" class="source-audio-action-item">
            <div class="source-audio-action-content">
              <span class="source-audio-action-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-for="path in iconPaths[item.command]" :key="path" :d="path" />
                </svg>
                <span>{{ item.title }}</span>
              </span>
              <span class="source-audio-action-description">{{ item.description }}</span>
            </div>
          </GlassDropdownItem>
        </template>
      </GlassDropdownMenu>
    </template>
  </GlassDropdown>
</template>

<style>
.source-audio-actions .source-audio-action-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  padding: 0 13px;
  border: 1px solid #dce5ef;
  border-radius: 999px;
  background: #f2f5f9;
  color: #36516f;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background .16s, border-color .16s;
}
.source-audio-actions .source-audio-action-trigger:hover,
.source-audio-actions .source-audio-action-trigger.is-open {
  background: #eaf0f7;
  border-color: #b9cadc;
}
.source-audio-actions .source-audio-action-trigger:focus-visible {
  outline: 2px solid #8aa5c8;
  outline-offset: 3px;
}
.source-audio-action-trigger > svg { width: 17px; height: 17px; }
.source-audio-action-trigger > .source-audio-action-chevron { width: 12px; height: 12px; transition: transform .16s; }
.source-audio-action-trigger.is-open > .source-audio-action-chevron { transform: rotate(180deg); }

/* The dropdown is teleported to body; its own class isolates it from page-wide overrides. */
.source-audio-action-popper.el-popper.is-light {
  overflow: hidden;
  padding: 0;
  border: 1px solid #d7e2ee !important;
  border-radius: 14px;
  background: #fff !important;
  box-shadow: 0 12px 36px #243b5a24, 0 2px 6px #243b5a0a !important;
}
.source-audio-action-popper .source-audio-action-list {
  box-sizing: border-box;
  width: min(360px, calc(100vw - 24px));
  max-height: min(540px, calc(100dvh - 32px));
  overflow-x: hidden;
  overflow-y: scroll;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 8px;
  background: #fff;
  scrollbar-width: thin;
  scrollbar-color: #bac7d6 #f4f7fa;
}
.source-audio-action-list::-webkit-scrollbar { width: 8px; }
.source-audio-action-list::-webkit-scrollbar-track { background: #f4f7fa; }
.source-audio-action-list::-webkit-scrollbar-thumb { border: 2px solid #f4f7fa; border-radius: 8px; background: #bac7d6; }
.source-audio-action-list::-webkit-scrollbar-thumb:hover { background: #91a5bd; }
.source-audio-action-popper .source-audio-action-heading {
  margin: 6px 6px 2px;
  padding: 15px 10px 8px;
  border-top: 1px solid #e8eef5;
  color: #71839a;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  list-style: none;
}
.source-audio-action-popper .source-audio-action-heading:first-child { margin-top: 0; padding-top: 8px; border-top: 0; }
.source-audio-action-popper .source-audio-action-item {
  display: block;
  margin: 2px 0;
  padding: 13px 16px;
  border-radius: 9px;
  color: #243b5a;
  line-height: normal;
  white-space: normal;
}
.source-audio-action-popper .source-audio-action-item:hover,
.source-audio-action-popper .source-audio-action-item:focus {
  background: #eef4fb;
  color: #294f7c;
}
.source-audio-action-popper .source-audio-action-item:focus-visible { outline: 2px solid #8aa5c8; outline-offset: -2px; }
.source-audio-action-title { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 600; line-height: 22px; }
.source-audio-action-title > svg { flex: 0 0 19px; width: 19px; height: 19px; color: #617993; }
.source-audio-action-description { display: block; margin-top: 6px; color: #71839a; font-size: 13px; font-weight: 400; line-height: 20px; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) {
  .source-audio-actions .source-audio-action-trigger,
  .source-audio-action-trigger > .source-audio-action-chevron { transition: none; }
}
</style>
