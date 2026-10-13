<script setup lang="ts">
import { computed, ref } from 'vue'
import { boundedValue } from '../../glass/policy'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ modelValue?: number; min?: number; max?: number; step?: number; disabled?: boolean; showTooltip?: boolean }>(), { modelValue: 0, min: 0, max: 100, step: .1 })
const emit = defineEmits<{ 'update:modelValue': [value: number]; input: [value: number]; change: [value: number] }>()
const pressed = ref(false)
function press(event: PointerEvent) {
  if (props.disabled) return
  pressed.value = true
  ;(event.currentTarget as HTMLInputElement).setPointerCapture?.(event.pointerId)
}
function release() { pressed.value = false }
const value = computed(() => boundedValue(props.modelValue, props.min, props.max, props.step))
const percentage = computed(() => props.max > props.min ? (value.value-props.min)/(props.max-props.min)*100 : 0)
function update(event: Event, commit: boolean) {
  const next = boundedValue(Number((event.target as HTMLInputElement).value), props.min, props.max, props.step)
  if (commit) emit('change', next)
  else { emit('update:modelValue', next); emit('input', next) }
}
</script>
<template>
  <span class="glass-slider lg-slider" :class="{ 'is-disabled': props.disabled, 'is-pressed': pressed }" :style="{ '--glass-value': `${percentage}%` }" :data-value="value">
    <span class="lg-slider-control" aria-hidden="true"><span class="lg-slider-track"><span class="lg-slider-fill"></span></span><span class="lg-slider-thumb lg-control-thumb"><span class="lg-control-face"></span><span class="lg-control-lens" data-refraction="5"></span></span></span>
    <input v-bind="$attrs" type="range" :value="value" :min="props.min" :max="props.max" :step="props.step" :disabled="props.disabled || props.max <= props.min" @input="update($event,false)" @change="update($event,true)" @pointerdown="press" @pointerup="release" @pointercancel="release" @lostpointercapture="release" @blur="release" />
  </span>
</template>
