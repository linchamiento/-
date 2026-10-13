<script setup lang="ts">
import { ref } from 'vue'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ modelValue?: boolean; disabled?: boolean; name?: string }>(), { modelValue: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; change: [value: boolean] }>()
const pressed = ref(false)
function press(event: PointerEvent) {
  if (props.disabled) return
  pressed.value = true
  ;(event.currentTarget as HTMLInputElement).setPointerCapture?.(event.pointerId)
}
function release() { pressed.value = false }
function change(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  emit('update:modelValue', value); emit('change', value)
}
</script>
<template>
  <span class="glass-switch lg-switch" :class="{ 'is-disabled': props.disabled, 'is-pressed': pressed }" :data-checked="props.modelValue ? '' : undefined" :data-presentation-checked="props.modelValue">
    <span class="lg-switch-track" aria-hidden="true"></span>
    <span class="lg-switch-thumb lg-control-thumb" aria-hidden="true"><span class="lg-control-face"></span><span class="lg-control-lens" data-refraction="7.75"></span></span>
    <input v-bind="$attrs" type="checkbox" role="switch" :checked="props.modelValue" :disabled="props.disabled" :name="props.name" :aria-checked="props.modelValue" @change="change" @pointerdown="press" @pointerup="release" @pointercancel="release" @lostpointercapture="release" @blur="release" />
  </span>
</template>
