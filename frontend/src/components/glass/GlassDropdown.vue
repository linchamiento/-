<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref } from 'vue'
import { sceneFor } from '../../glass/runtime'
import { glassPolicy, nextEnabledIndex } from '../../glass/policy'
import { dropdownKey } from './dropdown'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ placement?: string; popperClass?: string; trigger?: string; showArrow?: boolean }>(), { placement: 'bottom-end' })
const emit = defineEmits<{ command: [command: string]; 'visible-change': [open: boolean] }>()
const host = ref<HTMLElement>(), popup = ref<HTMLElement>(), portal = ref<HTMLElement>()
const open = ref(false), present = ref(false), closing = ref(false)
const position = ref({ left: '0px', top: '0px' })
let release: (() => void) | undefined, timer: ReturnType<typeof setTimeout> | undefined
const triggerElement = computed(() => host.value?.querySelector<HTMLElement>('button,a,[tabindex]'))
function positionMenu() {
  if (!popup.value || !portal.value || !triggerElement.value) return
  const source = triggerElement.value.getBoundingClientRect(), container = portal.value.getBoundingClientRect(), menu = popup.value.getBoundingClientRect()
  const desiredLeft = props.placement.endsWith('start') ? source.left : source.right-menu.width
  const left = Math.max(8, Math.min(desiredLeft, innerWidth-menu.width-8))
  const top = source.bottom+8+menu.height > innerHeight-8 ? Math.max(8,source.top-menu.height-8) : source.bottom+8
  position.value = { left: `${left-container.left+portal.value.scrollLeft}px`, top: `${top-container.top+portal.value.scrollTop}px` }
}
function finishClose() {
  release?.(); release=undefined; present.value=false; closing.value=false
}
async function show() {
  clearTimeout(timer); release?.(); release=undefined
  portal.value = host.value?.closest<HTMLElement>('[data-lg-scene],.glass-host') || undefined
  if (!portal.value) return
  open.value=true; present.value=true; closing.value=false
  emit('visible-change',true); triggerElement.value?.setAttribute('aria-expanded','true'); triggerElement.value?.setAttribute('aria-haspopup','menu')
  await nextTick(); positionMenu(); await nextTick()
  const controller = triggerElement.value && sceneFor(triggerElement.value)
  if (controller && popup.value && portal.value.dataset.lgState !== 'fallback') {
    release = controller.addSurface(popup.value, { ...glassPolicy, material: 'regular', radius: 28, morphFrom: () => triggerElement.value, morph: triggerElement.value?.closest('.lg-toolbar') ? 'detach' : 'become' })
    popup.value.dataset.lgOptics = portal.value.dataset.lgState === 'ready' ? 'ready' : 'fallback'
  }
  popup.value?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus()
}
function close(restore = false) {
  if (!open.value) return
  open.value=false; closing.value=true; emit('visible-change',false)
  triggerElement.value?.setAttribute('aria-expanded','false')
  if (restore) triggerElement.value?.focus()
  timer=setTimeout(finishClose, matchMedia('(prefers-reduced-motion: reduce)').matches || portal.value?.dataset.lgState === 'fallback' ? 0 : 420)
}
function toggle(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest(':disabled,[aria-disabled="true"]')) return
  open.value ? close(true) : void show()
}
function keys(event: KeyboardEvent) {
  if (event.key==='Escape') { event.preventDefault(); event.stopPropagation(); close(true); return }
  if (event.key==='Tab') { close(); return }
  if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return
  event.preventDefault()
  if (!open.value) { void show(); return }
  const items = [...popup.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') || []]
  const disabled = items.map(item=>item.disabled)
  const index = event.key==='Home' ? disabled.indexOf(false) : event.key==='End' ? disabled.lastIndexOf(false) : nextEnabledIndex(disabled,items.indexOf(document.activeElement as HTMLButtonElement),event.key==='ArrowUp'?-1:1)
  items[index]?.focus()
}
provide(dropdownKey, command => { if (command!==undefined) emit('command',command); close(true) })
function outside(event: PointerEvent) {
  if (event.target instanceof Node && !host.value?.contains(event.target) && !popup.value?.contains(event.target)) close()
}
document.addEventListener('pointerdown',outside)
window.addEventListener('resize',positionMenu)
document.addEventListener('scroll',positionMenu,true)
onBeforeUnmount(()=>{ clearTimeout(timer); release?.(); document.removeEventListener('pointerdown',outside); window.removeEventListener('resize',positionMenu); document.removeEventListener('scroll',positionMenu,true) })
</script>
<template>
  <span ref="host" v-bind="$attrs" class="glass-dropdown" @click.capture="toggle" @keydown="keys"><slot /></span>
  <Teleport v-if="present && portal" :to="portal">
    <div ref="popup" class="glass-menu lg-menu lg-surface" :class="props.popperClass" data-lg-manual :data-ending-style="closing ? '' : undefined" :style="position" @keydown="keys"><slot name="dropdown" /></div>
  </Teleport>
</template>
