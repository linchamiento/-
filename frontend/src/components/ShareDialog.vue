<script setup lang="ts">
import { ref, watch } from 'vue'; import { CopyDocument, Share } from '@element-plus/icons-vue'; import { ElMessage } from 'element-plus'; import { api } from '../api'; import type { Track } from '../types'
const props=defineProps<{open:boolean;track:Track|null}>(); const emit=defineEmits<{close:[]}>(); const link=ref(''),loading=ref(false)
async function create(){if(!props.track)return;loading.value=true;try{const result=await api.createShare(props.track.id);link.value=`${window.location.origin}/share/${result.token}`;await navigator.clipboard?.writeText(link.value);ElMessage.success('分享链接已复制')}catch{}finally{loading.value=false}}
async function copy(){if(link.value){await navigator.clipboard?.writeText(link.value);ElMessage.success('链接已复制')}}
watch(()=>[props.open,props.track?.id],()=>{if(props.open)void create()})
</script>
<template><el-dialog :model-value="props.open" width="min(520px,92vw)" title="分享作品" @close="emit('close')"><div class="share-dialog"><div class="share-icon"><Share/></div><h3>{{props.track?.title}}</h3><p>分享链接有效期 7 天，任何人都可以试听。</p><div class="share-link"><el-input v-model="link" readonly placeholder="正在生成链接…"/><button class="icon-button" :disabled="!link" aria-label="复制分享链接" @click="copy"><CopyDocument/></button></div><button class="dark-button share-copy" :disabled="loading||!link" @click="copy">复制链接</button></div></el-dialog></template>
