import type { App } from 'vue'
import { createGlassScene, attachSelectionLens, resolveMotion, type GlassSceneController, type SurfaceOptions } from '@glass-sdk/liquid-glass/dom'
import { glassPolicy, nextEnabledIndex } from './policy'

type Entry = { signature: string; remove: () => void }
type Scene = { controller: GlassSceneController; refresh: () => void; dispose: () => void }
const scenes = new Map<HTMLElement, Scene>()
const tabsSelector = '.workbench-nav,.studio-mode-toggle,.studio-mobile-tabs,.library-tabs,.category-tabs,.cost-tabs,.style-picker-categories,.style-picker-groups,.glass-lab-tabs'
const toolbarSelector = '.composer-actions,.qq-controls,.qq-actions,.now-playing-controls,.now-playing-actions'
const sceneSelector = '[data-lg-scene],.unified-shell.ui-glass,.auth-page,.share-page,.admin-page,.el-dialog,.el-message-box,.el-drawer,.el-select-dropdown,.el-dropdown-menu,.el-popper[role="tooltip"],.player-drawer,.now-playing-panel,.lyrics-tool-popover'
const controlsSelector = 'button,a[href],.el-select__wrapper,.lg-control-lens,[data-lg-surface]'

function owns(root: HTMLElement, el: HTMLElement) { return el.closest(sceneSelector) === root }
function visible(el: HTMLElement) { return el.isConnected && el.getClientRects().length > 0 }
function classes(el: HTMLElement, ...names: string[]) { for (const name of names) if (!el.classList.contains(name)) el.classList.add(name) }

export function sceneFor(element: HTMLElement) {
  const root = element.closest<HTMLElement>(sceneSelector)
  return root ? scenes.get(root)?.controller : undefined
}

function createScene(root: HTMLElement): Scene {
  root.classList.add('lg-scene', 'glass-host')
  root.dataset.lgState = 'loading'
  const background = document.createElement('div')
  background.className = 'lg-content glass-scene-content'
  background.setAttribute('aria-hidden', 'true')
  root.prepend(background)
  let destroyed = false
  const entries = new Map<HTMLElement, Entry>()
  const groups = new Map<HTMLElement, { indicator: HTMLElement; cleanup: () => void }>()
  const foregrounds = new Map<HTMLElement, () => void>()
  const edges = new Map<HTMLElement, () => void>()
  const toolbarKeys = new Map<HTMLElement, () => void>()
  const controller = createGlassScene(root, {
    maxSurfaces: glassPolicy.maxSurfaces,
    onDiagnostic(info) {
      if (destroyed) return
      root.dataset.lgState = info.error ? 'fallback' : info.surfaces > 0 && info.maps === info.surfaces ? 'ready' : 'loading'
      root.dataset.lgMaps = `${info.maps}/${info.surfaces}`
      entries.forEach((_, el) => { el.dataset.lgOptics = !info.error && info.maps === info.surfaces ? 'ready' : 'fallback' })
      if (info.error) root.dataset.lgError = info.error.message
      else delete root.dataset.lgError
    },
  })
  controller.setContent(background)
  const supported = globalThis.isSecureContext && 'gpu' in navigator && !matchMedia('(forced-colors: active)').matches
  if (!supported) root.dataset.lgState = 'fallback'

  function register(el: HTMLElement, options: SurfaceOptions, kind: string) {
    const signature = `${kind}:${options.radius}:${options.material}:${options.refraction}:${options.interactive}`
    const previous = entries.get(el)
    if (previous?.signature === signature) return
    previous?.remove()
    entries.delete(el)
    classes(el, 'lg-surface')
    el.dataset.lgKind = kind
    el.dataset.lgOptics = 'fallback'
    if (!supported || entries.size >= glassPolicy.maxSurfaces - 1) return
    const remove = controller.addSurface(el, { ...glassPolicy, ...options })
    entries.set(el, { signature, remove })
  }

  function refresh() {
    if (destroyed) return
    for (const [el, entry] of entries) if (!visible(el) || !owns(root, el)) { entry.remove(); delete el.dataset.lgOptics; entries.delete(el) }
    for (const [el, group] of groups) if (!visible(el) || !owns(root, el)) { group.cleanup(); group.indicator.remove(); groups.delete(el) }
    for (const [el, remove] of foregrounds) if (!visible(el) || !owns(root, el)) { remove(); foregrounds.delete(el) }
    for (const [el, remove] of edges) if (!visible(el) || !owns(root, el)) { remove(); edges.delete(el) }
    for (const [el, remove] of toolbarKeys) if (!visible(el) || !owns(root, el)) { remove(); toolbarKeys.delete(el) }

    if (root.matches('.el-dialog,.el-message-box,.el-drawer,.player-drawer,.now-playing-panel,.el-select-dropdown,.el-popper,.lyrics-tool-popover')) {
      register(root, { material: 'regular', radius: 28 }, 'panel')
    }
    for (const list of root.querySelectorAll<HTMLElement>(tabsSelector)) {
      if (!owns(root, list) || !visible(list)) continue
      classes(list, 'lg-tabs-list')
      // Route navigation remains navigation; section selectors retain tab semantics.
      const navigation = list.matches('.workbench-nav')
      if (!navigation) list.setAttribute('role', 'tablist')
      const items = [...list.querySelectorAll<HTMLElement>('button,a')].filter(item => item.parentElement === list)
      if (!items.length) continue
      for (const item of items) {
        classes(item, 'lg-tab')
        const active = item.classList.contains('active')
        if (navigation) item.setAttribute('aria-current', active ? 'page' : 'false')
        else { item.setAttribute('role', 'tab'); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1 }
      }
      register(list, { radius: 'capsule', interactive: true }, 'tabs')
      if (!groups.has(list)) {
        const indicator = document.createElement('span')
        indicator.className = 'lg-tab-indicator'
        indicator.setAttribute('aria-hidden', 'true')
        list.prepend(indicator)
        // The official selection lens discovers role=tab. Route navigation uses a
        // measured indicator instead, preserving link/navigation accessibility.
        const dispose = !navigation && supported ? controller.addAnimator(attachSelectionLens(indicator, () => resolveMotion('full'))) : () => {}
        const keydown = (event: KeyboardEvent) => {
          if (navigation || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
          const buttons = [...list.querySelectorAll<HTMLElement>('[role="tab"]')]
          const current = buttons.indexOf(document.activeElement as HTMLElement)
          const disabled = buttons.map(item => item.matches(':disabled,[aria-disabled="true"]'))
          const index = event.key === 'Home' ? disabled.indexOf(false) : event.key === 'End' ? disabled.lastIndexOf(false) : nextEnabledIndex(disabled, current, event.key === 'ArrowLeft' ? -1 : 1)
          if (index >= 0) { event.preventDefault(); buttons[index].focus(); buttons[index].click() }
        }
        list.addEventListener('keydown', keydown)
        groups.set(list, { indicator, cleanup: () => { dispose(); list.removeEventListener('keydown', keydown) } })
      }
      const indicator = groups.get(list)!.indicator
      if (navigation || !supported) {
        const item = items.find(item => item.classList.contains('active')) || items[0]
        Object.assign(indicator.style, { left: `${item.offsetLeft}px`, top: `${item.offsetTop}px`, width: `${item.offsetWidth}px`, height: `${item.offsetHeight}px` })
      }
      register(indicator, { radius: 'capsule' }, 'indicator')
    }
    for (const toolbar of root.querySelectorAll<HTMLElement>(toolbarSelector)) {
      if (!owns(root, toolbar) || !visible(toolbar)) continue
      classes(toolbar, 'lg-toolbar')
      toolbar.setAttribute('role', 'toolbar')
      if (!toolbar.hasAttribute('aria-label')) toolbar.setAttribute('aria-label', toolbar.matches('.composer-actions') ? '创作工具' : '播放工具')
      // Creation tools are separate buttons rather than one shared optical strip.
      if (!toolbar.matches('.composer-actions')) register(toolbar, { radius: 'capsule', interactive: true }, 'toolbar')
      if (!toolbarKeys.has(toolbar)) {
        const keys = (event: KeyboardEvent) => {
          if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
          if ((event.target as Element).matches('input')) return
          const buttons = [...toolbar.querySelectorAll<HTMLElement>('button,a')].filter(item=>!item.closest('.glass-menu'))
          const disabled = buttons.map(item=>item.matches(':disabled,[aria-disabled="true"]'))
          const current = buttons.indexOf(document.activeElement as HTMLElement)
          const index = event.key==='Home' ? disabled.indexOf(false) : event.key==='End' ? disabled.lastIndexOf(false) : nextEnabledIndex(disabled,current,event.key==='ArrowLeft'?-1:1)
          if (index>=0) { event.preventDefault(); buttons[index].focus() }
        }
        toolbar.addEventListener('keydown',keys)
        toolbarKeys.set(toolbar,()=>toolbar.removeEventListener('keydown',keys))
      }
    }
    for (const el of root.querySelectorAll<HTMLElement>(controlsSelector)) {
      if (!owns(root, el) || !visible(el) || el.closest('[data-lg-manual]')) continue
      if (el.matches('.advanced-section-toggle,.voice-item-copy,.queue-title,.source-picker-card,.voice-choice-card,.upload-source-option,.queue-play,.clip-main,.workbench-brand,.el-input-number__increase,.el-input-number__decrease,.el-input__clear,.el-input__password')) {
        classes(el, 'glass-content-action'); continue
      }
      if (el.closest(tabsSelector) && !el.matches('.lg-control-lens')) continue
      if (el.closest(toolbarSelector) && !el.matches('.lg-control-lens')) { classes(el, 'lg-toolbar-button'); continue }
      if (el.closest('[role="menu"],.el-select-dropdown') && !el.matches('.lg-control-lens')) { classes(el, 'glass-menu-action'); continue }
      const icon = !el.textContent?.trim() || el.matches('.header-icon,.user-pill,.player-button,.icon-button,.ghost,.cover-play,.clear-button,.queue-move')
      const thumb = el.classList.contains('lg-control-lens')
      if (!thumb) classes(el, 'lg-button')
      if (icon && !thumb) el.dataset.size = 'icon'
      const refraction = thumb ? Number(el.dataset.refraction || 5) : undefined
      register(el, { radius: icon ? 'circle' : 'capsule', interactive: !thumb, refraction }, thumb ? 'thumb' : 'button')
    }
    for (const el of root.querySelectorAll<HTMLElement>('[data-lg-foreground]')) {
      if (supported && owns(root, el) && visible(el) && !foregrounds.has(el)) foregrounds.set(el, controller.addForeground(el))
    }
    for (const el of [root, ...root.querySelectorAll<HTMLElement>('[data-lg-scroll]')]) {
      if (!el.matches('[data-lg-scroll]') && !root.matches('[data-lg-scroll]')) continue
      if (owns(root, el) && visible(el) && !edges.has(el)) edges.set(el, controller.addScrollEdges({ target: el, size: 28, blur: 12 }))
    }
  }

  return {
    controller, refresh,
    dispose() {
      destroyed = true
      entries.forEach(entry => entry.remove())
      groups.forEach(group => { group.cleanup(); group.indicator.remove() })
      toolbarKeys.forEach(remove => remove())
      edges.forEach(remove => remove()); foregrounds.forEach(remove => remove())
      controller.dispose(); background.remove()
      root.classList.remove('glass-host','lg-scene')
      delete root.dataset.lgState; delete root.dataset.lgMaps; delete root.dataset.lgError
    },
  }
}

export function installGlass(app: App) {
  let observer: MutationObserver | undefined
  let resize: ResizeObserver | undefined
  let frame = 0
  let active = false
  const scrollTimers = new Map<HTMLElement, number>()
  const onScroll = (event: Event) => {
    const el = event.target
    if (!(el instanceof HTMLElement) || !el.matches('.composer-column,.clip-list,.library-page')) return
    el.dataset.scrollActive = 'true'
    clearTimeout(scrollTimers.get(el))
    scrollTimers.set(el, window.setTimeout(() => { delete el.dataset.scrollActive; scrollTimers.delete(el) }, 800))
  }
  const sync = () => {
    frame = 0
    const roots = [...document.querySelectorAll<HTMLElement>(sceneSelector)].filter(visible)
    for (const [root, scene] of scenes) if (!roots.includes(root)) { scene.dispose(); resize?.unobserve(root); scenes.delete(root) }
    for (const root of roots) {
      if (!scenes.has(root)) { scenes.set(root, createScene(root)); resize?.observe(root) }
      scenes.get(root)!.refresh()
    }
  }
  const schedule = () => { if (active && !frame) frame = requestAnimationFrame(sync) }
  const start = () => {
    active = true
    document.addEventListener('scroll', onScroll, true)
    observer = new MutationObserver(records => {
      // SDK's own SVG/glass layers must never trigger a rediscovery loop.
      if (records.some(record => {
        const target = record.target as Element
        if (target.closest?.('svg,.glass-scene-content,.lg-glass-layer,.lg-tab-indicator')) return false
        if (record.type === 'childList') return [...record.addedNodes,...record.removedNodes].some(node => node instanceof HTMLElement && !node.matches('.glass-scene-content,.lg-glass-layer,.lg-tab-indicator'))
        return true
      })) schedule()
    })
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','disabled','aria-expanded'] })
    resize = new ResizeObserver(schedule)
    window.addEventListener('resize', schedule)
    document.addEventListener('click', schedule, true)
    schedule()
  }
  const stop = () => {
    active = false; cancelAnimationFrame(frame); frame = 0
    document.removeEventListener('scroll', onScroll, true)
    scrollTimers.forEach(timer => clearTimeout(timer)); scrollTimers.clear()
    observer?.disconnect(); resize?.disconnect()
    window.removeEventListener('resize', schedule); document.removeEventListener('click', schedule, true)
    scenes.forEach(scene => scene.dispose()); scenes.clear()
  }
  app.mixin({ mounted() { if (this === this.$root) start() }, beforeUnmount() { if (this === this.$root) stop() } })
  if (import.meta.hot) import.meta.hot.dispose(stop)
}
