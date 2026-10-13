<script setup lang="ts">
import { computed, ref } from 'vue'
import GlassDropdown from '../components/glass/GlassDropdown.vue'
import GlassDropdownItem from '../components/glass/GlassDropdownItem.vue'
import GlassDropdownMenu from '../components/glass/GlassDropdownMenu.vue'
import GlassSlider from '../components/glass/GlassSlider.vue'
import GlassSwitch from '../components/glass/GlassSwitch.vue'

const selectedTab = ref('按钮')
const checked = ref(true)
const volume = ref(62)
const menuValue = ref('清透')
const audioUrl = computed(() => 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=')
</script>

<template>
  <main class="glass-lab-page" data-lg-scene="glass-lab">
    <section class="glass-lab-panel" aria-labelledby="glass-lab-title">
      <p class="eyebrow">LIQUID GLASS / DOM</p>
      <h1 id="glass-lab-title">官方材质样板</h1>
      <p class="glass-lab-copy">用于检查降级状态、键盘操作和控件尺寸，不调用业务接口。</p>

      <nav class="glass-lab-tabs" aria-label="样板分类">
        <button v-for="tab in ['按钮', '菜单', '控制']" :key="tab" type="button" :class="{ active: selectedTab === tab }" @click="selectedTab = tab">{{ tab }}</button>
      </nav>

      <div class="glass-lab-row">
        <button type="button" class="glass-lab-primary">主要操作</button>
        <button type="button" class="glass-lab-icon" aria-label="次要操作">+</button>
        <GlassDropdown @command="menuValue = $event">
          <button type="button" class="glass-lab-button" :aria-label="`当前材质：${menuValue}`">{{ menuValue }}⌄</button>
          <template #dropdown>
            <GlassDropdownMenu aria-label="材质选择">
              <GlassDropdownItem v-for="item in ['清透', '柔和', '标准']" :key="item" :command="item">{{ item }}</GlassDropdownItem>
            </GlassDropdownMenu>
          </template>
        </GlassDropdown>
      </div>

      <div class="glass-lab-control">
        <label for="glass-lab-volume">音量 {{ volume }}%</label>
        <GlassSlider id="glass-lab-volume" v-model="volume" :min="0" :max="100" :step="1" aria-label="测试音量" />
      </div>
      <label class="glass-lab-switch"><span>启用动态折射</span><GlassSwitch v-model="checked" /></label>
      <audio :src="audioUrl" controls preload="metadata" aria-label="本地测试音频" />
      <p class="glass-lab-state" :data-state="checked ? 'enabled' : 'disabled'">场景：<code data-lg-state-text>{{ selectedTab }} / {{ checked ? '启用' : '降级' }}</code></p>
    </section>
  </main>
</template>
