<script setup lang="ts">
import { inject } from 'vue'
import { dropdownKey } from './dropdown'
defineOptions({ inheritAttrs: false })
const props=defineProps<{ command?: string; divided?: boolean; disabled?: boolean }>()
const select=inject(dropdownKey)
</script>
<template><li v-if="props.divided" role="separator"></li><li role="none"><button v-bind="$attrs" type="button" class="glass-menu-item" role="menuitem" :disabled="props.disabled" @click="select?.(props.command)"><slot /></button></li></template>
