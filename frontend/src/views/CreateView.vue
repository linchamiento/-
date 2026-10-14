<script setup lang="ts">
import GlassSlider from '../components/glass/GlassSlider.vue'
import GlassSwitch from '../components/glass/GlassSwitch.vue'
import GlassDropdown from '../components/glass/GlassDropdown.vue'
import GlassDropdownMenu from '../components/glass/GlassDropdownMenu.vue'
import GlassDropdownItem from '../components/glass/GlassDropdownItem.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { api, sunoApi } from '../api'
import { useAuthStore } from '../store/auth'
import { usePlayerStore } from '../store/player'
import type { EntityId, MusicTask, Track } from '../types'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Close, CollectionTag, Delete, Document, Headset, InfoFilled, List, MagicStick, Mic, MoreFilled, Refresh, Search, UploadFilled, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { pinyin } from 'pinyin-pro'
import { ADVANCED_STYLE_TAG_TOTAL, advancedStyleCategories, advancedStyleTags } from '../data/advanced-style-tags'

import SourceAudioActionMenu from '../components/SourceAudioActionMenu.vue'

const auth = useAuthStore(); const player = usePlayerStore()
let ideaController: AbortController | undefined
const loading = ref(false); const assistLoading = ref(false); const ideaLoading = ref(false); const ideaRequestMode = ref<'simple'|'advanced'|'sound'|null>(null); const lyricsLoading = ref(false); const uploadLoading = ref(false); const enhancedUploadLoading = ref(false); const enhancedUploadTaskId = ref<string | number | null>(null); const voiceLoading = ref(false); const voiceCreating = ref(false); const voiceItems = ref<any[]>([]); const voiceName = ref(''); const voiceFile = ref<File | null>(null); const task = ref<MusicTask | null>(null); const timer = ref<number>(); const sourceInput = ref<HTMLInputElement>(); const enhancedInput = ref<HTMLInputElement>(); const voiceInput = ref<HTMLInputElement>()
const activeMode = ref<'simple'|'advanced'|'sound'>('simple'); const simpleLyricsOpen = ref(false); const durationMode = ref<'auto'|'custom'>('auto'); const mobileView = ref<'create'|'library'>('create'); const advancedOpen = ref(false); const advancedLyricsOpen = ref(false); const advancedStyleOpen = ref(false); const advancedParamsOpen = ref(false); const uploadSourceOpen = ref(false); const pickerOpen = ref(false); const pickerSelection = ref<Track | null>(null); const voiceOpen = ref(false); const voiceStep = ref<'choose'|'name'|'audio'|'processing'|'success'>('choose'); const voiceSearch = ref(''); const voiceFromClip = ref(false); const voiceClip = ref<Track | null>(null); const createdVoice = ref<any>(null); const selectedVoice = ref<any>(null); const voiceProcessingError = ref(''); const libraryLoading = ref(false); const libraryItems = ref<Track[]>([]); const libraryTotal = ref(0); const libraryPage = ref(1); const pageJump = ref(1); const libraryQuery = ref(''); const activeFilter = ref('全部'); const sourceFile = ref<File | null>(null)
const stylePickerOpen = ref(false); const stylePickerTarget = ref<'style'|'negative'>('style'); const stylePickerCategory = ref(advancedStyleCategories[0]?.name || '曲风'); const stylePickerGroup = ref(''); const stylePickerSearch = ref(''); const stylePickerAutoTranslate = ref(true); const stylePickerSelection = ref<string[]>([]); const stylePickerSelectedCount = computed(() => stylePickerSelection.value.length); const styleEnhancerOpen = ref(false); const styleEnhancerExpanded = ref(false); const styleEnhancerPrompt = ref('')
const structureOpen = ref(false); const pinyinOpen = ref(false); const pinyinDialect = ref<'mandarin'|'cantonese'>('mandarin'); const pinyinRatio = ref<25|50|75|100>(50); const pinyinLoading = ref(false); const promptInput = ref<{textarea?: HTMLTextAreaElement}>()
const lyricsAiOpen = ref(false); const lyricsAiInstruction = ref(''); const lyricsAiInput = ref<HTMLInputElement>(); const lyricsAiTags = ref<HTMLDivElement>(); const lyricsAiHasLeft = ref(false); const lyricsAiHasRight = ref(false)
const lyricsAiPresets = [{label:'乡村歌曲',value:'写一首乡村歌曲'},{label:'夏日恋歌',value:'写一首夏日恋歌'},{label:'说唱歌词',value:'写一段说唱歌词'},{label:'摇滚',value:'写一首摇滚歌曲'},{label:'民谣',value:'写一首民谣'},{label:'电子舞曲',value:'写一首电子舞曲'},{label:'古风',value:'写一首古风歌曲'},{label:'爵士',value:'写一首爵士歌曲'},{label:'治愈',value:'写一首温柔治愈的歌'},{label:'失恋',value:'写一首关于失恋的歌词'}] as const
let cantoneseConverter: typeof import('to-jyutping') | null = null
const structureOptions = [{label:'前奏', marker:'[Intro]'},{label:'淡入', marker:'[Fade In]'},{label:'主歌', marker:'[Verse]'},{label:'预副歌', marker:'[Pre-Chorus]'},{label:'副歌', marker:'[Chorus]'},{label:'后副歌', marker:'[Post-Chorus]'},{label:'钩子', marker:'[Hook]'},{label:'桥段', marker:'[Bridge]'},{label:'间奏', marker:'[Interlude]'},{label:'尾奏', marker:'[Outro]'},{label:'淡出', marker:'[Fade Out]'}] as const
const pinyinRatios = [25,50,75,100] as const
const styles = ['Pop','Rock','HipHop','EDM','Lo-fi','古风']
const styleEnhancerPresets = ['流行说唱','电音合成器','吉他流行','城市民谣','氛围钢琴','复古迪斯科','国风古韵','爵士小调','摇滚力量','治愈轻音乐']
const selectedStyleTags = computed(() => advancedStyleTags.filter(item => stylePickerSelection.value.includes(item.en)))
const styleGenreSubcategories = ['常用','流行','摇滚','电子','嘻哈','节奏布鲁斯与灵魂','乡村','民谣','爵士','古典','金属','国风','拉丁','雷鬼','世界音乐','布鲁斯','放克','迪斯科','舞曲']
function tagInGenreGroup(en:string, group:string){
  if(group==='常用') return advancedStyleTags.filter(item => item.category==='曲风').slice(0, 18).some(item => item.en===en)
  const rules:Record<string,string[]>={
    流行:['pop','synthpop','electropop','city pop','k-pop','j-pop'], 摇滚:['rock','punk','grunge','emo','post rock','metal'], 电子:['electro','electronic','synth','house','techno','trance','garage','breakbeat','vaporwave','chillout'], 嘻哈:['hip hop','rap','trap','drill','boom bap'],
    '节奏布鲁斯与灵魂':['r&b','soul','gospel'], 乡村:['country','americana','bluegrass'], 民谣:['folk'], 爵士:['jazz','bebop','bossa nova'], 古典:['classical','opera'], 金属:['metal'], 国风:['chinese','pipa','erhu','guzheng'], 拉丁:['latin','samba','tango','reggae'], 雷鬼:['reggae','dub'], 世界音乐:['world'], 布鲁斯:['blues'], 放克:['funk'], 迪斯科:['disco'], 舞曲:['dance','house','edm']
  }
  return (rules[group]||[]).some(token => en.toLocaleLowerCase().includes(token))
}
const activeStyleCategory = computed(() => {
  const category=advancedStyleCategories.find(item => item.name === stylePickerCategory.value) || advancedStyleCategories[0]
  if(category.name !== '曲风') return category
  return { ...category, groups: styleGenreSubcategories.map(name => ({ name, tags: advancedStyleTags.filter(item => item.category==='曲风' && tagInGenreGroup(item.en,name)) })) }
})
const activeStyleTags = computed(() => {
  const query = stylePickerSearch.value.trim().toLocaleLowerCase()
  const group = stylePickerGroup.value
  const tags = stylePickerCategory.value === '曲风' && group ? advancedStyleTags.filter(item => item.category === '曲风' && tagInGenreGroup(item.en, group)) : group && group !== '全部' ? (activeStyleCategory.value.groups.find(item => item.name === group)?.tags || []).map(item => ({ ...item, category: activeStyleCategory.value.name, group })) : advancedStyleTags.filter(item => item.category === activeStyleCategory.value.name)
  return query ? tags.filter(item => `${item.zh} ${item.en} ${(item.keywords ?? []).join(' ')}`.toLocaleLowerCase().includes(query)) : tags
})
const fallbackIdeas = [
  '轻快的城市流行歌曲，BPM约108，明亮大调，清脆鼓组配温暖贝斯和电钢琴。女声用自然轻盈的语气演唱，主歌描写下班后的街灯与晚风，副歌逐渐打开情绪，加入层叠和声，桥段短暂收束后回到开阔的最后副歌。',
  '深夜氛围感电子流行，BPM约92，降A大调，柔和合成器铺底、颗粒感鼓机和低沉贝斯共同推进。男声克制地演唱关于错过与重逢的故事，副歌加入宽阔混响和上行旋律，结尾保留雨声般的高频纹理与渐远的城市灯光。',
  '热血中文摇滚，BPM约156，E大调，现场感鼓组配失真吉他和有力贝斯线。男声在主歌中压低情绪，副歌释放高音与群唱，间奏加入短促吉他独奏，最后以连续鼓点和明亮和弦结束，呈现冲破困境后的坚定感。',
  '温柔的东方民谣，BPM约78，D大调，木吉他、笛子和轻微手鼓构成自然编曲。女声靠近耳边讲述远行、旧信和故乡的灯火，副歌加入二胡长音和细腻和声，尾奏让笛声与木吉他逐渐淡出，留下安静的余韵。',
  '复古迪斯科舞曲，BPM约122，F小调，弹跳贝斯、四拍底鼓、弦乐切分和明亮合成器形成强烈律动。女声带有俏皮咬字，主歌轻巧推进，副歌加入多人和声与铜管点缀，桥段降低鼓点后重新进入热闹舞池。',
  '纯音乐电影配乐，BPM约84，C小调，钢琴、弦乐、低音鼓和宽阔氛围音色描绘清晨山谷。开头保持留白，中段逐步加入弦乐层次与深沉低频，高潮后回落到简单钢琴动机，结尾像雾气一样缓慢散开。'
]
const styleTermTranslations:Array<[RegExp,string]> = [
  [/folk-pop/gi,'民谣流行'],[/melodic acoustic rock/gi,'旋律感原声摇滚'],[/acoustic rock/gi,'原声摇滚'],[/modern pop-rock/gi,'现代流行摇滚'],
  [/futuristic/gi,'未来感'],[/dramatic fusion/gi,'戏剧化融合'],[/fusion/gi,'融合'],[/punk rock/gi,'朋克摇滚'],[/electronic pop/gi,'电子流行'],[/electroclash/gi,'电气冲突'],[/synth techno/gi,'合成器科技舞曲'],[/goa trance/gi,'果阿电子舞曲'],[/dub reggae/gi,'dub雷鬼'],[/gangster rap/gi,'黑帮说唱'],[/hip-hop/gi,'嘻哈'],[/emo trap/gi,'情绪陷阱'],[/hindustani classical/gi,'印度斯坦古典'],[/southern gospel/gi,'南方福音'],[/volksmusik/gi,'民俗音乐'],[/iskelmä/gi,'伊斯凯尔玛流行'],[/indie pop/gi,'独立流行'],[/independent pop/gi,'独立流行'],[/r&b/gi,'节奏布鲁斯'],
  [/carefree living/gi,'自在生活'],[/love that didn't translate/gi,'无法互相理解的爱情'],[/song about/gi,'歌曲主题为'],[/male vocal/gi,'男声'],[/female vocal/gi,'女声'],[/trance vocal/gi,'迷幻人声'],[/live vocals/gi,'现场感演唱'],[/instrumental/gi,'纯音乐'],[/major scale/gi,'大调音阶'],[/minor scale/gi,'小调音阶'],[/major/gi,'大调'],[/minor/gi,'小调'],
  [/cajón/gi,'卡洪鼓'],[/lyra arpeggios/gi,'里拉琴琶音'],[/ambient synth pads/gi,'氛围合成器铺底'],[/electronic beat grid/gi,'电子节拍网格'],[/tribal percussion/gi,'部落打击乐'],[/syncopated bass guitar/gi,'切分贝斯'],[/syncopated percussion/gi,'切分打击乐'],[/nylon-string strumming/gi,'尼龙弦吉他扫弦'],[/sparse piano intro/gi,'稀疏钢琴开场'],[/brass synth stabs/gi,'铜管式合成器重击'],[/double-time drum accents/gi,'双倍速度鼓点'],[/chantable rhythmic motif/gi,'易于跟唱的节奏动机'],[/bittersweet resolve/gi,'苦乐交织的收束'],[/instrumental build/gi,'纯音乐层次推进'],[/distorted electric guitar chugs/gi,'失真电吉他闷音'],[/distorted electric guitar/gi,'失真电吉他'],[/electric guitar/gi,'电吉他'],[/acoustic guitar intro/gi,'原声吉他开场'],[/layered acoustic guitar/gi,'层叠原声吉他'],[/slap bass/gi,'拍击贝斯'],[/round bass/gi,'圆润贝斯'],[/punchy drum kit/gi,'强劲鼓组'],[/808 sub-bass/gi,'808超低音'],[/sharp congas/gi,'锐利康加鼓'],[/metal percussion/gi,'金属打击乐'],[/cinematic strings/gi,'电影感弦乐'],[/brass stabs/gi,'铜管重击'],[/synth arpeggios/gi,'合成器琶音'],[/synth strings/gi,'合成弦乐'],[/dub delay/gi,'dub延迟'],[/plate reverb/gi,'板式混响'],[/tape saturation/gi,'磁带饱和'],[/soft verse dynamics/gi,'柔和的主歌动态'],[/epic chorus lift/gi,'史诗感副歌推进'],[/grounded empowerment/gi,'扎实坚定的力量感'],[/sparse intro/gi,'留白感开场'],[/explosive chorus/gi,'爆发式副歌'],[/wide stereo mix/gi,'宽阔立体声混音'],[/tight percussion/gi,'紧凑打击乐'],[/syncopated drums/gi,'切分鼓组'],[/syncopation/gi,'切分节奏'],[/full bass/gi,'饱满低音'],[/powerful rock/gi,'强劲摇滚'],[/gravelly vocals/gi,'沙哑人声'],[/low-fi/gi,'低保真质感'],[/euphoria/gi,'欣快情绪'],[/hook/gi,'副歌钩子'],[/rhyming/gi,'押韵处理'],[/pop indie/gi,'独立流行'],[/modern/gi,'现代'],[/sharp/gi,'锐利'],[/cinematic/gi,'电影感'],[/distorted/gi,'失真'],[/synth/gi,'合成器'],[/acoustic/gi,'原声'],[/layered/gi,'层叠'],[/dramatic/gi,'戏剧化'],[/wide/gi,'宽阔'],[/stereo/gi,'立体声'],[/mix/gi,'混音'],[/build/gi,'层次推进'],[/punchy/gi,'强劲'],[/nylon-string/gi,'尼龙弦'],[/strumming/gi,'扫弦'],[/delay/gi,'延迟'],[/double-time/gi,'双倍速度'],[/drum accents/gi,'鼓点重音'],[/chantable/gi,'易于跟唱'],[/rhythmic/gi,'节奏感'],[/motif/gi,'动机'],[/resolve/gi,'收束']
]
const selectedSourceTrack = ref<Track | null>(null)
const voiceSampleUrl = ref(''); const voiceSampleDuration = ref(0); const voiceSampleError = ref(''); const voiceSampleChecking = ref(false); const voiceDragging = ref(false)
const voiceRecording = ref(false); const voiceRecordingStarting = ref(false); const voiceRecordingSeconds = ref(0)
let voiceSampleToken = 0; let voiceRecordingToken = 0; let voiceRecorder: MediaRecorder | null = null; let voiceMediaStream: MediaStream | null = null; let voiceRecordingTimer: number | undefined
let voiceAudioContext: AudioContext | null = null
const voiceCanSubmit = computed(() => !!voiceFile.value && !voiceSampleChecking.value && !voiceRecording.value && !voiceRecordingStarting.value && !voiceCreating.value)
const form = reactive({prompt:'',style:'Pop',styleDescription:'',mood:'快乐',vocalType:'AUTO',language:'中文',lyricsMode:'AI',lyrics:'',songTitle:'',negativeTags:'',model:'suno-v6',weirdness:50,styleWeight:50,duration:null as number|null,variety:null as number|null,sourceClipId:'',sourceAudioUrl:'',sourceTitle:'',audioWeight:25,voiceId:'',soundType:'单次',soundBpm:100,soundKey:'任意',soundLoop:false,instrumental:false,maxMode:false})
const instrumental = computed(() => form.vocalType === 'INSTRUMENTAL' || form.instrumental); const generationCost = computed(() => form.maxMode ? 20 : 10); const showLegacyPrompt = computed(() => activeMode.value !== 'advanced'); const filterMap:Record<string,string>={全部:'all',收藏:'favorite',我收藏的:'favorite',最近生成:'generated',生成:'generated',上传:'upload',翻唱:'remix'}; const visibleTracks = computed(() => libraryItems.value.filter(t => (activeFilter.value !== '创作中' || ['WAITING','PROCESSING','UNCERTAIN'].includes(t.status))))
watch(form, value => localStorage.setItem('shengxu-draft', JSON.stringify(value)), {deep:true})
watch(activeMode, mode => { if(mode==='advanced' && form.styleDescription==='Pop，快乐') form.styleDescription='' })
watch(libraryQuery, () => { window.clearTimeout((loadLibrary as any)._timer); (loadLibrary as any)._timer = window.setTimeout(() => { libraryPage.value = 1; pageJump.value = 1; loadLibrary() }, 260) })
watch(activeFilter, (filter, previous) => { if(filter !== previous){ libraryPage.value = 1; pageJump.value = 1; loadLibrary() } })
onMounted(() => { const draft=localStorage.getItem('shengxu-draft'); const template=sessionStorage.getItem('shengxu-template'); const saved=draft?JSON.parse(draft):null; if(saved)Object.assign(form,saved); if(template){Object.assign(form,JSON.parse(template));sessionStorage.removeItem('shengxu-template')} if(form.variety!=null&&(form.variety<0||form.variety>4))form.variety=null; if(!form.styleDescription.trim()&&(saved?.style||saved?.mood)){form.styleDescription=[saved.style,saved.mood].filter(Boolean).join('，')} durationMode.value=form.duration==null?'auto':'custom'; const id=localStorage.getItem('shengxu-active-task'); if(id)poll(id); loadLibrary() })
watch(voiceOpen, open => { if(!open){ cancelVoiceWork(); resetVoiceSample() } }, {flush:'sync'})
watch(pickerOpen, (open, previous) => { if(!open&&previous&&voiceFromClip.value&&!voiceOpen.value){voiceStep.value='choose';voiceOpen.value=true} }, {flush:'post'})
onBeforeUnmount(() => { ideaController?.abort(); clearInterval(timer.value); window.clearTimeout((loadLibrary as any)._timer); cancelVoiceWork(); resetVoiceSample() })

let libraryRequestId=0
async function loadLibrary(){const requestId=++libraryRequestId;libraryLoading.value=true;const query=libraryQuery.value;const pageNumber=libraryPage.value;const filter=filterMap[activeFilter.value]||'all';try{const page=await api.library(query,pageNumber,filter);if(requestId===libraryRequestId){libraryItems.value=page.items||[];libraryTotal.value=page.total||0}}finally{if(requestId===libraryRequestId)libraryLoading.value=false}}
async function submit(){if(!form.prompt.trim()||loading.value)return;if((auth.user?.creditBalance||0)<generationCost.value){ElMessage.warning('积分不足，请前往账户与积分查看余额');return;}if(task.value&&['WAITING','PROCESSING','UNCERTAIN'].includes(task.value.status)){ElMessage.warning(task.value.status==='UNCERTAIN'?'上一笔任务提交状态待核实，请先检查作品库，不要重复生成':'已有生成任务在处理中，请等待当前任务完成');return}if(activeMode.value==='advanced'&&(form.styleDescription.length>1000||form.negativeTags.length>1000)){ElMessage.warning('风格描述和排除风格不能超过 1000 个字符');return}loading.value=true;const isAdvanced=activeMode.value==='advanced';const isSound=activeMode.value==='sound';const requestedVocal=activeMode.value==='simple'?(instrumental.value?'INSTRUMENTAL':'AUTO'):form.vocalType;const simpleLyricsEnabled=activeMode.value==='simple'&&simpleLyricsOpen.value&&!instrumental.value;const customLyricsEnabled=isAdvanced?(!instrumental.value&&!!form.prompt.trim()):(form.lyricsMode==='USER'&&!instrumental.value&&simpleLyricsEnabled);const cost=generationCost.value;const styleValue=isAdvanced?form.styleDescription:form.style;try{task.value=await api.createTask({prompt:form.prompt,style:styleValue,mood:isAdvanced?'':form.mood,vocalType:isSound?'INSTRUMENTAL':requestedVocal,language:instrumental.value?null:form.language,lyricsMode:customLyricsEnabled?'USER':'AI',lyrics:customLyricsEnabled?(isAdvanced?form.prompt:form.lyrics):null,songTitle:form.songTitle||null,negativeTags:form.negativeTags||null,model:form.model,weirdness:form.weirdness,styleWeight:form.styleWeight,duration:isAdvanced&&durationMode.value==='custom'?form.duration:null,variety:isAdvanced?form.variety:null,sourceClipId:form.sourceClipId||null,sourceType:isSound?'SOUND':(form.sourceClipId?'REMIX':isAdvanced?'CUSTOM':'GENERATED'),maxMode:form.maxMode,sourceAudioUrl:form.sourceAudioUrl||null,sourceTitle:form.sourceTitle||sourceFile.value?.name||null,audioWeight:isAdvanced?form.audioWeight/100:(form.sourceClipId?form.audioWeight/100:null),voiceId:form.voiceId||null,soundType:isSound?form.soundType:null,soundBpm:isSound?form.soundBpm:null,soundKey:isSound?form.soundKey:null,soundLoop:isSound?form.soundLoop:null},crypto.randomUUID());if(auth.user)auth.user.creditBalance-=cost;localStorage.setItem('shengxu-active-task',String(task.value.id));startPoll();await loadLibrary()}finally{loading.value=false}}
async function poll(id:EntityId){try{task.value=await api.task(id);if(['SUCCESS','FAILED','UNCERTAIN'].includes(task.value.status)){localStorage.removeItem('shengxu-active-task');clearInterval(timer.value);await auth.restore();await loadLibrary();if(task.value.status==='FAILED')ElMessage.error(task.value.errorMessage||'音乐生成失败');if(task.value.status==='UNCERTAIN')ElMessage.warning(task.value.errorMessage||'提交结果待核实，请先检查作品库')}}catch(error){localStorage.removeItem('shengxu-active-task');if(axios.isAxiosError(error)&&error.response?.status===404)ElMessage.error('任务记录不存在，未继续轮询；请勿重复提交')}}
function startPoll(){clearInterval(timer.value);timer.value=window.setInterval(()=>task.value&&poll(task.value.id),4000)}
async function suggestIdea(){
  if(ideaLoading.value||loading.value||assistLoading.value)return
  const controller=new AbortController()
  ideaController=controller
  const requestMode=activeMode.value
  ideaRequestMode.value=requestMode
  ideaLoading.value=true
  try{
    const r=await sunoApi.generateInspiration(form.model, instrumental.value, controller.signal)
    const response=typeof r==='string'?JSON.parse(r):r
    let nextPrompt=(response as any)?.data?.prompt??(response as any)?.prompt
    if(typeof nextPrompt!=='string'||!nextPrompt.trim())throw new Error((response as any)?.message||'灵感接口没有返回歌曲描述，请重试')
    // The backend already asks boost-style for Simplified Chinese. Translating
    // again here added a third sequential upstream request and was the main
    // reason this button could take tens of seconds.
    nextPrompt=localizeStyleDescription(nextPrompt)
    if(controller.signal.aborted||activeMode.value!==requestMode)return
    form.prompt=Array.from(nextPrompt.trim()).slice(0,2000).join('')
    ElMessage.success('已生成一条歌曲灵感')
  }catch(error){
    if(axios.isCancel(error))return
    if(controller.signal.aborted||activeMode.value!==requestMode)return
    const fallback=fallbackIdeas[Math.floor(Math.random()*fallbackIdeas.length)]
    form.prompt=fallback.slice(0,2000)
    const message=axios.isAxiosError(error)?error.response?.data?.message:undefined
    ElMessage.warning(message?'灵感接口暂时不可用，已使用本地灵感':'灵感接口未返回内容，已使用本地灵感')
  }finally{if(ideaController===controller){ideaLoading.value=false;ideaRequestMode.value=null;ideaController=undefined}}
}
async function generateInspirationPrompt(){
  if(ideaLoading.value||loading.value||assistLoading.value)return
  const controller=new AbortController()
  ideaController=controller
  const requestMode=activeMode.value
  ideaRequestMode.value=requestMode
  ideaLoading.value=true
  try{
    const suggestionModel=['suno-v6','suno-v6-wild','suno-v6-mini'].includes(form.model)?form.model:'suno-v6'
    const response=await sunoApi.promptSuggestions(suggestionModel, controller.signal)
    const prompts=(response as any)?.data?.prompts??(response as any)?.prompts
    const candidates=Array.isArray(prompts)?prompts.filter((item:any)=>typeof item==='string'&&item.trim()):[]
    if(!candidates.length)throw new Error((response as any)?.message||'灵感接口没有返回歌曲描述，请重试')
    const prompt=String(candidates[0]).trim()
    if(controller.signal.aborted||activeMode.value!==requestMode)return
    form.prompt=Array.from(prompt).slice(0,2000).join('')
    ElMessage.success('已生成一条歌曲灵感')
  }catch(error){
    if(axios.isCancel(error))return
    if(controller.signal.aborted||activeMode.value!==requestMode)return
    const fallback=fallbackIdeas[Math.floor(Math.random()*fallbackIdeas.length)]
    form.prompt=fallback.slice(0,2000)
    const message=axios.isAxiosError(error)?error.response?.data?.message:undefined
    ElMessage.warning(message?'灵感接口暂时不可用，已使用本地灵感':'灵感接口未返回内容，已使用本地灵感')
  }finally{if(ideaController===controller){ideaLoading.value=false;ideaRequestMode.value=null;ideaController=undefined}}
}
function localizeStyleDescription(value:string){
  let localized=value.trim()
  for(const [pattern,replacement] of styleTermTranslations)localized=localized.replace(pattern,replacement)
  localized=localized.replace(/\s*,\s*/g,'，').replace(/\s+/g,' ').trim()
  if(localized&&!/[。！？；）)]$/.test(localized))localized+='。'
  return localized
}
async function polishStyle(){
  const isAdvancedStyle=activeMode.value==='advanced'
  const source=isAdvancedStyle?form.styleDescription:form.prompt.trim()
  if(!source.trim())return
  assistLoading.value=true
  try{
    const r=await sunoApi.boostStyle(source,isAdvancedStyle?'':form.lyrics,instrumental.value)
    const data=r?.data??r
    const v=data?.upsampledStyle||data?.stylePrompt||data?.prompt||data?.data?.upsampledStyle||data?.data?.stylePrompt||data?.data?.prompt
    if(v){
      if(isAdvancedStyle)form.styleDescription=String(v).trim().slice(0,1000)
      else form.prompt=v
    }
  }finally{assistLoading.value=false}
}
function openStylePicker(target:'style'|'negative'='style'){
  if(activeMode.value!=='advanced')return
  stylePickerTarget.value=target
  stylePickerOpen.value=true
  stylePickerSearch.value=''
  stylePickerCategory.value=advancedStyleCategories[0]?.name||'曲风'
  stylePickerGroup.value=stylePickerCategory.value==='曲风'?'常用':''
  stylePickerSelection.value=[]
}
function closeStylePicker(){stylePickerOpen.value=false; stylePickerSelection.value=[]}
function toggleStyleTag(en:string){
  stylePickerSelection.value=stylePickerSelection.value.includes(en)
    ? stylePickerSelection.value.filter(item=>item!==en)
    : [...stylePickerSelection.value,en]
}
function clearStyleSelection(){stylePickerSelection.value=[]}
function normalizeStyleDescription(value:string){return value.replace(/[;,、|]+/g,'，').split('，').map(item=>item.trim()).filter(Boolean).join('，').slice(0,1000)}
function applyStyleSelection(){
  if(!stylePickerSelection.value.length)return
  const labels=selectedStyleTags.value.map(item=>item.en)
  const field=stylePickerTarget.value==='negative'?'negativeTags':'styleDescription'
  const existing=normalizeStyleDescription(form[field]).split('，').filter(Boolean)
  const existingKeys=new Set(existing.map(item=>item.toLocaleLowerCase()))
  form[field]=[...existing,...labels.filter(label=>!existingKeys.has(label.toLocaleLowerCase()))].join('，').slice(0,1000)
  closeStylePicker()
}
function pickStyleEnhancerPreset(value:string){styleEnhancerPrompt.value=value}
async function enhanceAdvancedStyle(){
  const source=styleEnhancerPrompt.value.trim()||form.styleDescription.trim()
  if(!source||assistLoading.value)return
  assistLoading.value=true
  try{
    const r=await sunoApi.boostStyle(source,'',instrumental.value)
    const data=r?.data??r
    const value=data?.upsampledStyle||data?.stylePrompt||data?.prompt||data?.data?.upsampledStyle||data?.data?.stylePrompt||data?.data?.prompt
    if(value)form.styleDescription=normalizeStyleDescription(String(value))
    else ElMessage.warning('风格增强接口没有返回内容')
  }catch{ElMessage.error('风格增强失败，请稍后重试')}
  finally{assistLoading.value=false}
}
async function generateLyrics(instructionOverride?:string){if(lyricsLoading.value||instrumental.value)return false;const instruction=instructionOverride?.trim()||form.prompt.trim()||'请写一首中文歌曲歌词';lyricsLoading.value=true;let success=false;try{const response=unwrapSuno(await sunoApi.generateLyrics(form.model,instruction,`${form.style}，${form.mood}，${form.language}`,form.songTitle));const data=response?.data??response;const lyrics=data?.edited_lyrics??data?.lyrics??response?.edited_lyrics??response?.lyrics;if(typeof lyrics!=='string'||!lyrics.trim())throw new Error('歌词接口没有返回内容');if(activeMode.value==='advanced')form.prompt=lyrics.trim();else{form.lyrics=lyrics.trim();form.lyricsMode='USER'}success=true;ElMessage.success('歌词已生成，可继续编辑')}catch(error){const message=axios.isAxiosError(error)?error.response?.data?.message:undefined;ElMessage.error(message||'歌词生成失败，请稍后重试')}finally{lyricsLoading.value=false}return success}
function updateLyricsAiScroll(){const element=lyricsAiTags.value;if(!element){lyricsAiHasLeft.value=false;lyricsAiHasRight.value=false;return}lyricsAiHasLeft.value=element.scrollLeft>2;lyricsAiHasRight.value=element.scrollLeft+element.clientWidth<element.scrollWidth-2}
function scrollLyricsAiTags(direction:number){lyricsAiTags.value?.scrollBy({left:direction*160,behavior:'smooth'})}
function openLyricsAi(){if(instrumental.value||lyricsLoading.value)return;structureOpen.value=false;pinyinOpen.value=false;lyricsAiOpen.value=true;nextTick(()=>{updateLyricsAiScroll();lyricsAiInput.value?.focus()})}
function closeLyricsAi(){lyricsAiOpen.value=false}
function pickLyricsAiPrompt(value:string){lyricsAiInstruction.value=value;nextTick(()=>lyricsAiInput.value?.focus())}
async function submitLyricsAi(){const instruction=lyricsAiInstruction.value.trim();if(!instruction||lyricsLoading.value||instrumental.value)return;const success=await generateLyrics(instruction);if(success){lyricsAiInstruction.value='';lyricsAiOpen.value=false}}
function promptTextarea(){return promptInput.value?.textarea}
function insertStructure(marker:string){if(activeMode.value!=='advanced')return;const textarea=promptTextarea();const value=form.prompt;const start=textarea?.selectionStart??value.length;const end=textarea?.selectionEnd??start;const before=value.slice(0,start);const after=value.slice(end);const prefix=before.length&&!before.endsWith('\n')?'\n':'';const suffix=after.length&&!after.startsWith('\n')?'\n':'';const inserted=`${prefix}${marker}${suffix}`;const nextValue=before+inserted+after;if(nextValue.length>2000){ElMessage.warning('插入结构后歌词超过 2000 字限制');return}form.prompt=nextValue;structureOpen.value=false;pinyinOpen.value=false;nextTick(()=>{const nextPosition=(before+inserted).length-suffix.length;const nextTextarea=promptTextarea();nextTextarea?.focus();nextTextarea?.setSelectionRange(nextPosition,nextPosition)})}
function isChineseCharacter(value:string){return /^[\u3400-\u9fff]$/.test(value)}
function shouldConvert(index:number, ratio:25|50|75|100){return ratio===100||(ratio===25?index%4===0:ratio===50?index%2===0:index%4!==3)}
function convertMandarin(value:string, ratio:25|50|75|100){let chineseIndex=0;return value.replace(/[\u3400-\u9fff]+/g, run=>{const syllables=pinyin(run,{toneType:'symbol',type:'array',toneSandhi:true,segmentit:2});let converted='';for(let index=0;index<run.length;index+=1){const character=run[index];const replace=shouldConvert(chineseIndex,ratio);converted+=replace?(ratio===100?`${syllables[index]??character}${index<run.length-1?' ':''}`:syllables[index]??character):character;chineseIndex+=1}return converted})}
async function convertCantonese(value:string, ratio:25|50|75|100){cantoneseConverter??=await import('to-jyutping');const entries=cantoneseConverter.getJyutpingList(value);let chineseIndex=0;let converted='';let pendingJyutping:string[]=[];const flush=()=>{if(pendingJyutping.length){converted+=pendingJyutping.join(' ');pendingJyutping=[]}};for(const [character, jyutping] of entries){if(!isChineseCharacter(character)){flush();converted+=character;continue}const replace=shouldConvert(chineseIndex,ratio);if(replace&&jyutping){if(ratio===100)pendingJyutping.push(jyutping);else converted+=jyutping}else{flush();converted+=character}chineseIndex+=1}flush();return converted}
async function applyPinyin(ratio:25|50|75|100){if(!form.prompt.trim()||pinyinLoading.value||instrumental.value||activeMode.value!=='advanced')return;pinyinLoading.value=true;try{const converted=pinyinDialect.value==='mandarin'?convertMandarin(form.prompt,ratio):await convertCantonese(form.prompt,ratio);if(converted.length>2000){ElMessage.warning('转换后歌词超过 2000 字限制');return}form.prompt=converted;pinyinRatio.value=ratio;pinyinOpen.value=false;structureOpen.value=false;await nextTick();const textarea=promptTextarea();textarea?.focus();textarea?.setSelectionRange(converted.length,converted.length)}finally{pinyinLoading.value=false}}
function closeLyricsTools(){structureOpen.value=false;pinyinOpen.value=false;lyricsAiOpen.value=false}
function setDurationMode(mode:'auto'|'custom'){durationMode.value=mode;if(mode==='auto')form.duration=null;else if(!form.duration)form.duration=180}
function chooseMode(mode:typeof activeMode.value){const previous=activeMode.value;if(mode!==previous&&ideaLoading.value&&ideaRequestMode.value!==mode){ideaController?.abort();ideaController=undefined;ideaLoading.value=false;ideaRequestMode.value=null}activeMode.value=mode;advancedOpen.value=mode==='advanced';closeLyricsTools();if(mode==='simple')form.lyricsMode='AI';if(mode!=='simple')simpleLyricsOpen.value=false;if(mode==='sound')form.instrumental=true;else if(previous==='sound')form.instrumental=false}
function clearForm(){Object.assign(form,{prompt:'',styleDescription:'',mood:'快乐',vocalType:'AUTO',language:'中文',lyricsMode:'AI',lyrics:'',songTitle:'',negativeTags:'',weirdness:50,styleWeight:50,duration:null,variety:null,sourceClipId:'',sourceAudioUrl:'',sourceTitle:'',audioWeight:25,voiceId:'',soundType:'单次',soundBpm:100,soundKey:'任意',soundLoop:false,instrumental:false,maxMode:false});selectedVoice.value=null;durationMode.value='auto';simpleLyricsOpen.value=false;advancedLyricsOpen.value=false;advancedStyleOpen.value=false;advancedParamsOpen.value=false;sourceFile.value=null;localStorage.removeItem('shengxu-draft');ElMessage.success('已清空创作表单')}
function triggerUpload(){uploadSourceOpen.value=true}
function triggerLocalSourceUpload(){uploadSourceOpen.value=false;nextTick(()=>sourceInput.value?.click())}
function triggerEnhancedUpload(){uploadSourceOpen.value=false;nextTick(()=>enhancedInput.value?.click())}
async function openLibrary(){voiceFromClip.value=voiceOpen.value;uploadSourceOpen.value=false;voiceOpen.value=false;pickerOpen.value=true;pickerSelection.value=null;libraryQuery.value='';activeFilter.value='全部';libraryPage.value=1;pageJump.value=1;await loadLibrary()}
function chooseTrack(track:Track){if(!track.providerSongId||track.providerSongId.toLowerCase().startsWith('pending:')){ElMessage.warning('这首作品尚未获得可用的 Suno 来源 ID');return}pickerSelection.value=track}
async function confirmTrackSelection(){
  const track=pickerSelection.value
  if(!track?.providerSongId||voiceCreating.value)return
  if(voiceFromClip.value){
    voiceClip.value=track; voiceName.value=track.title||'我的音色'; pickerSelection.value=null; voiceStep.value='name'; voiceOpen.value=true; pickerOpen.value=false
    return
  }
  form.sourceClipId=String(track.providerSongId);form.sourceAudioUrl=track.audioUrl||'';form.sourceTitle=track.title||'';selectedSourceTrack.value=track;chooseMode('advanced');pickerSelection.value=null;pickerOpen.value=false;ElMessage.success(`已选择音频：${track.title||'未命名作品'}`)
}
async function createVoiceFromClip(){
  const track=voiceClip.value
  if(!track?.providerSongId||!voiceName.value.trim()||voiceCreating.value)return
  const title=voiceName.value.trim()
  await submitVoiceCreation(() => sunoApi.execute({method:'POST',path:'/api/music/voice-profile/create-from-clip',body:{source_song_id:String(track.providerSongId),title,client_request_id:crypto.randomUUID()}},{timeout:95000}), title)
}
let voicePollToken=0
let voiceListRequestId=0
let voiceListController: AbortController | undefined
function voiceId(voice:any){return String(voice?.voice_id??voice?.id??'').trim()}
function voiceReady(voice:any){const status=String(voice?.status??voice?.state??'').toLowerCase();return voice?.is_available===true||(['ready','available','completed','success','succeeded'].includes(status)&&voice?.is_available!==false)}
function voiceFailed(voice:any){return ['failed','error','cancelled','canceled'].includes(String(voice?.status??voice?.state??'').toLowerCase())}
async function fetchVoiceItems(signal?:AbortSignal){
  const result=unwrapSuno(await sunoApi.execute({method:'GET',path:'/api/music/voice-profile/list'},{timeout:10000,signal}))
  if(result?.success===false)throw new Error(result.message||'音色列表加载失败')
  const data=result?.data??result
  const voices=Array.isArray(data?.items)?data.items:Array.isArray(data?.voices)?data.voices:Array.isArray(data)?data:[]
  return voices
}
function cancelVoiceWork(){voicePollToken++;voiceListRequestId++;voiceListController?.abort();voiceListController=undefined;voiceCreating.value=false;voiceLoading.value=false;stopVoiceRecording(true)}
function returnToVoiceList(){cancelVoiceWork();resetVoiceSample();voiceStep.value='choose';voiceFromClip.value=false;voiceClip.value=null;createdVoice.value=null;voiceProcessingError.value='';loadVoices(true)}
function closeVoiceDialog(){if(voiceStep.value!=='choose'){returnToVoiceList();return}voiceOpen.value=false}
function beginVoiceCreationFromClip(){voiceProcessingError.value='';createVoiceFromClip()}
function beginVoiceComposition(){if(!createdVoice.value)return;chooseVoice(createdVoice.value);createdVoice.value=null;voiceClip.value=null;voiceFromClip.value=false}
function removeSelectedVoice(){form.voiceId='';selectedVoice.value=null}
function clearSelectedSource(){selectedSourceTrack.value=null;form.sourceClipId='';form.sourceAudioUrl='';form.sourceTitle='';sourceFile.value=null}
function handleSourceAction(action:string){const labels:Record<string,string>={remix:'翻唱',mashup:'融合',sample:'采样',inspo:'灵感',edit:'音频编辑'};if(action==='edit'){ElMessage.info('音频编辑功能即将打开');return}ElMessage.info(`${labels[action]||'音频操作'}已准备，将使用当前音频作为来源`)}
async function chooseFile(event:Event){const input=event.target as HTMLInputElement;sourceFile.value=input.files?.[0]||null;if(!sourceFile.value)return;uploadLoading.value=true;try{const response=await sunoApi.executeMultipart({method:'POST',path:'/api/create-ui/music/upload-source',file:sourceFile.value});const result=(response as any)?.data??response;const clipId=result?.clip_id??result?.id;if(clipId&&!String(clipId).toLowerCase().startsWith('pending:'))form.sourceClipId=String(clipId);if(result?.audio_url)form.sourceAudioUrl=String(result.audio_url);form.sourceTitle=String(result?.title||sourceFile.value.name);ElMessage.success('来源音频上传完成')}catch{ElMessage.error('来源音频上传失败，请稍后重试')}finally{uploadLoading.value=false;input.value=''}}
async function chooseEnhancedFile(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;enhancedUploadLoading.value=true;try{const result=await sunoApi.executeMultipart({method:'POST',path:'/api/music/enhanced-upload',file,params:{title:file.name.replace(/\.[^.]+$/,'')}});const data=(result as any)?.data??result;const taskId=data?.task_id??data?.id;if(!taskId)throw new Error('强化上传未返回任务编号');enhancedUploadTaskId.value=taskId;form.sourceTitle=file.name;ElMessage.success('强化上传已提交，正在处理音频');await pollEnhancedUpload(taskId)}catch{enhancedUploadTaskId.value=null;ElMessage.error('强化上传失败，原有来源音频保持不变')}finally{enhancedUploadLoading.value=false;input.value=''}}
async function pollEnhancedUpload(taskId:string|number){for(let attempt=0;attempt<60;attempt++){await new Promise(resolve=>window.setTimeout(resolve,3000));try{const response=await sunoApi.execute({method:'GET',path:`/api/music/enhanced-upload/${taskId}`});const data=(response as any)?.data??response;const current=data?.task??data;const status=String(current?.status||'').toLowerCase();if(['completed','complete','success','succeeded'].includes(status)){const songId=current?.song_id??current?.clip_id??current?.id; if(songId&&!String(songId).toLowerCase().startsWith('pending:'))form.sourceClipId=String(songId);if(current?.audio_url)form.sourceAudioUrl=String(current.audio_url);enhancedUploadTaskId.value=null;ElMessage.success('强化上传完成，可以继续创作');return}if(['failed','error','cancelled','canceled'].includes(status)){throw new Error('强化上传失败')}}catch(error){if(error instanceof Error&&error.message==='强化上传失败')throw error;ElMessage.warning('强化上传状态暂时无法查询，任务仍可在作品库查看');return}}ElMessage.info('强化上传仍在处理中，完成后可在作品库查看')}
function unwrapSuno(value:any){if(value instanceof ArrayBuffer){try{return JSON.parse(new TextDecoder().decode(new Uint8Array(value)))}catch{return {}}}if(typeof value==='string'){try{return JSON.parse(value)}catch{return {}}}return value||{}}
const voiceListError = ref('')
let voiceListLoadedAt = 0
async function loadVoices(force = true){
  if(!voiceOpen.value){voiceStep.value='choose';voiceOpen.value=true}
  if(voiceLoading.value||(!force&&voiceListLoadedAt&&Date.now()-voiceListLoadedAt<30000))return
  const requestId=++voiceListRequestId
  voiceListController=new AbortController()
  voiceLoading.value=true;voiceListError.value=''
  try{
    const voices=await fetchVoiceItems(voiceListController.signal)
    if(requestId!==voiceListRequestId)return
    voiceItems.value=voices
    if(form.voiceId)selectedVoice.value=voiceItems.value.find(voice=>voiceId(voice)===form.voiceId)??selectedVoice.value
    voiceListLoadedAt=Date.now()
  }catch{if(requestId===voiceListRequestId)voiceListError.value='音色列表暂时无法加载，请点击刷新重试。你仍可创建新音色或选择已有音频。'}
  finally{if(requestId===voiceListRequestId){voiceLoading.value=false;voiceListController=undefined}}
}
function beginVoiceCreation(){resetVoiceSample();voiceFromClip.value=false;voiceClip.value=null;voiceStep.value='name';voiceName.value='';createdVoice.value=null}
function continueVoiceNaming(){if(!voiceName.value.trim()){ElMessage.warning('请输入音色名称');return}voiceStep.value='audio'}
function triggerVoiceUpload(){voiceInput.value?.click()}
function resetVoiceSample(){voiceSampleToken++;if(voiceSampleUrl.value)URL.revokeObjectURL(voiceSampleUrl.value);voiceSampleUrl.value='';voiceFile.value=null;voiceSampleDuration.value=0;voiceSampleChecking.value=false;voiceSampleError.value='';voiceDragging.value=false}
async function acceptVoiceSample(file:File){
  if(voiceRecording.value||voiceRecordingStarting.value||voiceCreating.value)return
  resetVoiceSample()
  if(!/\.(mp3|wav|m4a)$/i.test(file.name)){voiceSampleError.value='请选择 MP3、WAV 或 M4A 格式的音频。';return}
  if(file.size>10*1024*1024){voiceSampleError.value='音频文件不能超过 10 MB。';return}
  const token=voiceSampleToken
  const url=URL.createObjectURL(file)
  voiceSampleChecking.value=true
  try{
    const duration=await new Promise<number>((resolve,reject)=>{
      const audio=new Audio();audio.preload='metadata'
      const timeout=window.setTimeout(()=>finish(new Error('读取音频超时，请重新选择文件。')),10000)
      function finish(error?:Error){window.clearTimeout(timeout);audio.onloadedmetadata=null;audio.onerror=null;const duration=audio.duration;audio.removeAttribute('src');audio.load();error?reject(error):resolve(duration)}
      audio.onloadedmetadata=()=>Number.isFinite(audio.duration)?finish():finish(new Error('无法读取音频时长，请重新选择文件。'))
      audio.onerror=()=>finish(new Error('无法读取此音频，请确认文件可正常播放。'))
      audio.src=url
    })
    if(token!==voiceSampleToken){URL.revokeObjectURL(url);return}
    if(duration<10)throw new Error('声音样本至少需要 10 秒，请重新录制或上传。')
    voiceFile.value=file;voiceSampleDuration.value=duration;voiceSampleUrl.value=url
  }catch(error){URL.revokeObjectURL(url);if(token===voiceSampleToken)voiceSampleError.value=error instanceof Error?error.message:'读取音频失败。'}
  finally{if(token===voiceSampleToken)voiceSampleChecking.value=false}
}
function dropVoiceSample(event:DragEvent){voiceDragging.value=false;const file=event.dataTransfer?.files[0];if(file)acceptVoiceSample(file)}
async function startVoiceRecording(){
  if(voiceRecording.value||voiceRecordingStarting.value||voiceSampleChecking.value)return
  resetVoiceSample()
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){voiceSampleError.value='当前浏览器不支持录音，请上传音频文件。';return}
  const token=++voiceRecordingToken
  voiceRecordingStarting.value=true
  let context:AudioContext|null=null
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false})
    if(token!==voiceRecordingToken){stream.getTracks().forEach(track=>track.stop());return}
    voiceMediaStream=stream
    context=new AudioContext();voiceAudioContext=context
    await context.resume()
    if(token!==voiceRecordingToken)return
    const chunks:Blob[]=[]
    const mimeType=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type))
    const recorder=new MediaRecorder(stream,mimeType?{mimeType}:{})
    voiceRecorder=recorder
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)}
    recorder.onerror=()=>{if(token===voiceRecordingToken){stopVoiceRecording(true);voiceSampleError.value='录音失败，请重新录制或上传音频。'}}
    recorder.onstop=async()=>{
      stream.getTracks().forEach(track=>track.stop())
      if(voiceMediaStream===stream)voiceMediaStream=null
      if(voiceRecorder===recorder)voiceRecorder=null
      if(token!==voiceRecordingToken)return
      voiceSampleChecking.value=true
      try{
        const buffer=await context!.decodeAudioData(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer())
        if(token!==voiceRecordingToken)return
        const samples=buffer.getChannelData(0)
        const wav=new ArrayBuffer(44+samples.length*2);const view=new DataView(wav)
        function write(offset:number,value:string){for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i))}
        write(0,'RIFF');view.setUint32(4,wav.byteLength-8,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples.length*2,true)
        for(let i=0;i<samples.length;i++){const sample=Math.max(-1,Math.min(1,samples[i]!));view.setInt16(44+i*2,sample*(sample<0?32768:32767),true)}
        await acceptVoiceSample(new File([wav],`录制源声-${Date.now()}.wav`,{type:'audio/wav'}))
      }catch{if(token===voiceRecordingToken){voiceSampleChecking.value=false;voiceSampleError.value='录音转换失败，请重新录制或上传音频。'}}
      finally{await context?.close().catch(()=>{});if(voiceAudioContext===context)voiceAudioContext=null}
    }
    recorder.start(250);voiceRecording.value=true;voiceRecordingSeconds.value=0
    const started=Date.now()
    voiceRecordingTimer=window.setInterval(()=>{voiceRecordingSeconds.value=Math.floor((Date.now()-started)/1000);if(voiceRecordingSeconds.value>=100)stopVoiceRecording()},250)
  }catch(error){if(token===voiceRecordingToken){stopVoiceRecording(true);voiceSampleError.value=error instanceof DOMException&&error.name==='NotAllowedError'?'麦克风权限未开启，请允许录音或上传音频。':'无法使用麦克风，请检查设备或上传音频。'}}
  finally{if(token===voiceRecordingToken)voiceRecordingStarting.value=false}
}
function stopVoiceRecording(discard=false){
  window.clearInterval(voiceRecordingTimer);voiceRecordingTimer=undefined;voiceRecording.value=false
  if(discard){voiceRecordingToken++;voiceRecordingStarting.value=false;voiceSampleChecking.value=false}
  const recorder=voiceRecorder
  if(recorder&&recorder.state!=='inactive')recorder.stop()
  voiceMediaStream?.getTracks().forEach(track=>track.stop());voiceMediaStream=null
  if(discard){voiceRecorder=null;void voiceAudioContext?.close().catch(()=>{});voiceAudioContext=null}
}
function backFromVoiceAudio(){stopVoiceRecording(true);voiceStep.value='name'}
async function chooseVoiceFile(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';if(file)await acceptVoiceSample(file)}
async function createVoiceProfile(enhanced=false){
  if(!voiceCanSubmit.value||!voiceFile.value)return
  const file=voiceFile.value
  const title=voiceName.value.trim()||file.name
  await submitVoiceCreation(() => sunoApi.executeMultipart({method:'POST',path:'/api/music/voice-profile/create',file,params:{title,source_file_name:file.name,enhanced:String(enhanced),client_request_id:crypto.randomUUID()}},{timeout:95000}), title)
}
async function submitVoiceCreation(submitRequest:()=>Promise<unknown>, title:string){
  const knownIds=new Set(voiceItems.value.map(voiceId).filter(Boolean))
  const token=++voicePollToken
  voiceCreating.value=true;voiceProcessingError.value=''
  voiceStep.value='processing'
  try{
    const result=unwrapSuno(await submitRequest())
    if(token!==voicePollToken)return
    if(result?.success===false)throw new Error(result.message||'音色创建失败')
    const data=result?.data??result
    const submittedVoice=data?.voice??data
    const submittedId=voiceId(submittedVoice)
    function complete(voice:any){createdVoice.value=voice;voiceName.value=voice.title||voice.name||title;resetVoiceSample();voiceStep.value='success'}
    if(submittedId&&voiceReady(submittedVoice)){complete(submittedVoice);return}
    for(let attempt=0;attempt<40&&token===voicePollToken;attempt++){
      if(attempt)await new Promise(resolve=>window.setTimeout(resolve,3000))
      if(token!==voicePollToken)break
      let voices:any[]
      try{voices=await fetchVoiceItems()}catch{continue}
      if(token!==voicePollToken)return
      voiceItems.value=voices;voiceListLoadedAt=Date.now()
      const match=voices.find((voice:any)=>submittedId?voiceId(voice)===submittedId:(!knownIds.has(voiceId(voice))&&(voice.title??voice.name)===title))
      if(!match)continue
      if(voiceFailed(match))throw new Error(match.error_message||'音色创建失败')
      if(voiceReady(match)){complete(match);return}
    }
    if(token===voicePollToken)voiceProcessingError.value='音色仍在处理中。请稍后刷新状态，完成后才能用于创作。'
  }catch(error){if(token===voicePollToken){const response=axios.isAxiosError(error)?unwrapSuno(error.response?.data):null;voiceProcessingError.value=response?.message||(error instanceof Error?error.message:'音色创建失败，请稍后重试');voiceStep.value='processing'}}
  finally{if(token===voicePollToken)voiceCreating.value=false}
}
function chooseVoice(voice:any){const id=voiceId(voice);if(!id||!voiceReady(voice))return;form.voiceId=id;selectedVoice.value=voice;const vocalType=String(voice?.vocal_type??voice?.vocalType??voice?.gender??'').toUpperCase();if(vocalType==='MALE'||vocalType==='FEMALE')form.vocalType=vocalType;else if(form.vocalType==='INSTRUMENTAL')form.vocalType='AUTO';form.instrumental=false;clearSelectedSource();chooseMode('advanced');voiceOpen.value=false;ElMessage.success(`已选择音色：${voice?.title??voice?.name??id}`)}
function voiceDuration(voice:any){const duration=Number(voice?.source_duration_seconds??voice?.duration_seconds??voice?.duration);return Number.isFinite(duration)&&duration>0?duration:0}
function voiceSourceLabel(voice:any){const fromClip=Boolean(voice?.source_song_id||voice?.source_clip_id||voice?.source_type==='clip');return [fromClip?'来自已有音频':'来自人声样本',voiceDuration(voice)?`${Math.round(voiceDuration(voice))}s`:'',voice?.source_file_name||''].filter(Boolean).join(' · ')}
function voiceSourceUrl(voice:any){return voice?.source_audio_url||voice?.audio_url||voice?.source_url||''}
function voiceIsPlaying(voice:any){return player.track?.id===`voice-source:${voiceId(voice)}`&&player.playing}
function playVoiceSource(voice:any){const audioUrl=voiceSourceUrl(voice);if(!audioUrl)return;const id=`voice-source:${voiceId(voice)}`;if(player.track?.id===id){player.toggle();return}player.play({id,taskId:id,title:voice.title||voice.name||'音色源音频',status:'SUCCESS',createdAt:new Date().toISOString(),audioUrl,coverUrl:voice.cover_url||voice.image_url,duration:voiceDuration(voice)})}
const filteredVoices = computed(() => { const q=voiceSearch.value.trim().toLocaleLowerCase(); return voiceItems.value.filter(voiceReady).filter(v => !q || `${v?.title??v?.name??''} ${v?.source_file_name??''}`.toLocaleLowerCase().includes(q)) })
function playTrack(track:Track){if(player.track?.id===track.id)player.toggle();else if(track.audioUrl)player.play(track,visibleTracks.value)}
async function toggleFavorite(track:Track){const next=!player.isFavorite(track);const updated=await api.favoriteTrack(track.id,next);player.syncFavorite(track.id,!!updated.favorite);const index=libraryItems.value.findIndex(item=>item.id===track.id);if(index>=0)libraryItems.value[index]={...libraryItems.value[index],favorite:updated.favorite};if(player.track?.id===track.id)player.track={...player.track,favorite:updated.favorite};ElMessage.success(next?'已收藏':'已取消收藏')}
async function removeTrack(track:Track){try{await ElMessageBox.confirm('删除后会从当前音乐库隐藏，但不会重新提交上游任务。','删除作品',{type:'warning',confirmButtonText:'删除',cancelButtonText:'取消'});await api.deleteTrack(track.id);libraryItems.value=libraryItems.value.filter(item=>item.id!==track.id);libraryTotal.value=Math.max(0,libraryTotal.value-1);if(player.track?.id===track.id)player.reset();ElMessage.success('作品已删除')}catch(error){if(error!=='cancel')throw error}}
function jumpPage(){const pages=Math.max(1,Math.ceil(libraryTotal.value/12));libraryPage.value=Math.min(pages,Math.max(1,Number(pageJump.value)||1));pageJump.value=libraryPage.value;loadLibrary()}
const quickStyles = ['Pop','民谣','EDM','R&B','HipHop','Rock','古风','国风','轻音乐','影视配乐','ACG','爵士']
const quickMoods = ['治愈','忧郁','浪漫','热血','轻松','神秘','夏日','悲伤','孤独','怀旧','梦幻','宁静','快乐']
async function pastePrompt(){try{form.prompt=(await navigator.clipboard.readText()).slice(0,2000)}catch{ElMessage.info('无法读取剪贴板，请在输入框中使用 Ctrl+V 粘贴')}}
</script>

<template>
  <div class="page create-page studio-page" :class="`mobile-${mobileView}`">
    <header class="studio-intro">
      <div><h1>让灵感，成为音乐。</h1><p>创作工作台 · 从一个想法开始</p></div>
      <span class="studio-intro-note">描述 · 生成 · 聆听</span>
    </header>
    <div class="studio-mobile-tabs" role="tablist" aria-label="工作区视图">
      <button :class="{active:mobileView==='create'}" role="tab" :aria-selected="mobileView==='create'" @click="mobileView='create'">创作面板</button>
      <button :class="{active:mobileView==='library'}" role="tab" :aria-selected="mobileView==='library'" @click="mobileView='library'">作品列表</button>
    </div>
    <section class="composer-column" data-lg-scene="composer" data-lg-scroll>
      <div class="creation-tabs"><button class="active" @click="chooseMode('simple')">音乐创作</button><button :disabled="ideaLoading" @click="generateInspirationPrompt">灵感生成</button></div>
      <div class="composer-toolbar">
        <div class="mode-toggle studio-mode-toggle"><button :class="{active:activeMode==='simple'}" @click="chooseMode('simple')">简易</button><button :class="{active:activeMode==='advanced'}" @click="chooseMode('advanced')">高级</button><button :class="{active:activeMode==='sound'}" @click="chooseMode('sound')">音效</button></div>
        <el-select v-model="form.model" class="model-select" aria-label="模型"><el-option label="V6" value="suno-v6"/><el-option label="V6 Wild" value="suno-v6-wild"/><el-option label="V6 Mini" value="suno-v6-mini"/></el-select>
      </div>
      <input ref="sourceInput" type="file" accept="audio/*" hidden @change="chooseFile" />
      <input ref="enhancedInput" type="file" accept="audio/*" hidden @change="chooseEnhancedFile" />
      <div class="composer-actions"><button @click="triggerUpload"><UploadFilled/>上传音频</button><button @click="loadVoices(false)"><Mic/>人声克隆</button><button :disabled="ideaLoading" @click="generateInspirationPrompt"><MagicStick/>灵感生成</button></div>
      <section v-if="form.voiceId" class="selected-voice-card" aria-label="已选音色"><span class="selected-voice-avatar"><img v-if="selectedVoice?.cover_url||selectedVoice?.image_url" :src="selectedVoice.cover_url||selectedVoice.image_url" alt=""/><Mic v-else/></span><strong>{{selectedVoice?.title||selectedVoice?.name||'已选音色'}}</strong><button type="button" @click="loadVoices(false)">更换</button><button type="button" @click="removeSelectedVoice">移除</button></section>
      <section v-if="selectedSourceTrack" class="selected-source-card">
        <div class="selected-source-heading">
          <strong>音频</strong>
          <div class="selected-source-tools">
            <SourceAudioActionMenu @command="handleSourceAction" />
            <button type="button" class="selected-source-remove" aria-label="移除来源音频" @click="clearSelectedSource"><Delete aria-hidden="true" /></button>
          </div>
        </div>
        <div class="selected-source-meta">
          <div class="selected-source-cover"><img v-if="selectedSourceTrack.coverUrl" :src="selectedSourceTrack.coverUrl" alt="" /><span v-else>♪</span><i>▶</i></div>
          <div class="selected-source-copy">
            <strong>{{ selectedSourceTrack.title || '未命名作品' }}</strong>
            <small>{{ selectedSourceTrack.duration ? `00:00 / ${Math.floor(selectedSourceTrack.duration / 60)}:${String(Math.floor(selectedSourceTrack.duration % 60)).padStart(2, '0')}` : '来源音频' }}</small>
          </div>
        </div>
        <div class="selected-source-wave" aria-hidden="true"><span v-for="n in 48" :key="n" :style="{ height: `${12 + (n * 17) % 30}px` }"></span></div>
      </section>

      <template v-if="showLegacyPrompt">


      <div class="field-card prompt-card" :aria-busy="ideaLoading" @click="closeLyricsTools" @keydown.esc="closeLyricsTools"><div class="field-header prompt-field-header"><div><strong>{{activeMode==='advanced'?'歌词':'歌曲描述'}}</strong><span>{{form.prompt.length}} / 2000</span></div><div v-if="activeMode==='advanced'" class="lyrics-tools-shell" @click.stop><button type="button" class="lyrics-tool-button" :class="{active:structureOpen}" aria-label="插入歌词结构" :aria-expanded="structureOpen" @click="structureOpen=!structureOpen;pinyinOpen=false"><List class="lyrics-tool-icon" aria-hidden="true"/>结构</button><button type="button" class="lyrics-tool-button" :class="{active:pinyinOpen}" aria-label="歌词拼音转换" :aria-expanded="pinyinOpen" :disabled="!form.prompt.trim()||pinyinLoading" @click="pinyinOpen=!pinyinOpen;structureOpen=false"><span class="lyrics-tool-pinyin-glyph" aria-hidden="true"><b>A</b><i>文</i></span>{{pinyinLoading?'转换中':'拼音'}}</button><div v-if="structureOpen" class="lyrics-tool-popover lyrics-structure-popover" role="menu"><button v-for="option in structureOptions" :key="option.marker" type="button" role="menuitem" @click="insertStructure(option.marker)">{{option.label}}</button></div><div v-if="pinyinOpen" class="lyrics-tool-popover lyrics-pinyin-popover" role="menu"><div class="lyrics-popover-title">转写方式</div><div class="lyrics-dialect" role="group" aria-label="转写方式"><button type="button" :class="{active:pinyinDialect==='mandarin'}" :aria-pressed="pinyinDialect==='mandarin'" @click="pinyinDialect='mandarin'">普通话</button><button type="button" :class="{active:pinyinDialect==='cantonese'}" :aria-pressed="pinyinDialect==='cantonese'" @click="pinyinDialect='cantonese'">粤语</button></div><div class="lyrics-popover-title">选择转写比例</div><div class="lyrics-ratio-grid"><button v-for="ratio in pinyinRatios" :key="ratio" type="button" role="menuitem" :class="{active:pinyinRatio===ratio}" :disabled="pinyinLoading" @click="applyPinyin(ratio)">{{ratio}}%</button></div><button type="button" class="lyrics-popover-cancel" @click="pinyinOpen=false">取消</button></div></div></div><div v-if="ideaLoading" class="idea-skeleton" role="status" aria-live="polite" :aria-label="activeMode==='advanced'?'正在生成歌词':'正在生成歌曲描述'"><span class="idea-skeleton-line idea-skeleton-line-wide"></span><span class="idea-skeleton-line idea-skeleton-line-medium"></span><span class="idea-skeleton-line idea-skeleton-line-short"></span><span class="idea-skeleton-line idea-skeleton-line-tiny"></span></div><el-input v-else v-model="form.prompt" type="textarea" :rows="activeMode==='advanced'?10:8" maxlength="2000" resize="none" :placeholder="activeMode==='advanced'?'[Verse]\n在这里输入歌词…':'描述你想听到的音乐：主题、画面、节奏、乐器和情绪……'"/><div class="prompt-card-footer"><button v-if="activeMode==='simple'" :disabled="ideaLoading||instrumental" @click="chooseMode('advanced')"><Document/>歌词</button><button v-if="activeMode==='simple'" :disabled="ideaLoading" @click="suggestIdea"><Refresh/>随便来一首</button><div v-if="activeMode==='advanced'" class="lyrics-ai-control" @click.stop><div v-if="lyricsAiOpen" class="lyrics-ai-panel" role="region" aria-label="AI 生成歌词"><div class="lyrics-ai-chips-row"><button v-if="lyricsAiHasLeft" class="lyrics-ai-arrow" type="button" aria-label="向左查看更多标签" @click="scrollLyricsAiTags(-1)"><ArrowLeft/></button><div ref="lyricsAiTags" class="lyrics-ai-tags" @scroll="updateLyricsAiScroll"><button v-for="preset in lyricsAiPresets" :key="preset.label" type="button" class="lyrics-ai-chip" @click="pickLyricsAiPrompt(preset.value)">{{preset.label}}</button></div><button v-if="lyricsAiHasRight" class="lyrics-ai-arrow" type="button" aria-label="向右查看更多标签" @click="scrollLyricsAiTags(1)"><ArrowRight/></button><button class="lyrics-ai-close" type="button" aria-label="收起歌词写作栏" @click="closeLyricsAi"><Close/></button></div><div class="lyrics-ai-input-row"><span v-if="lyricsLoading" class="lyrics-ai-skeleton" role="status" aria-label="正在生成歌词"><span class="lyrics-ai-skeleton-bar"></span></span><input v-else ref="lyricsAiInput" v-model="lyricsAiInstruction" class="lyrics-ai-input" placeholder="写一首乡村歌曲" aria-label="歌词主题或要求" :disabled="lyricsLoading" @keydown.enter.exact.prevent="submitLyricsAi"/><button class="lyrics-ai-send" type="button" aria-label="AI 生成歌词" :disabled="lyricsLoading||!lyricsAiInstruction.trim()" @click="submitLyricsAi"><svg v-if="!lyricsLoading" class="lyrics-ai-wand-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="m7.1 24.9 15.7-15.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m7.1 24.9-2 2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m10.2 22.7-2-2" fill="none" opacity=".72" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/><path d="m24.1 3.1.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z" fill="currentColor"/><path d="m13.2 4.5.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".9"/><path d="m25.6 17.8.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".82"/></svg><span v-else class="lyrics-ai-loading-dot">…</span></button></div></div><div v-else class="lyrics-button-row"><button class="lyrics-generate-button" type="button" aria-label="AI 生成歌词" :disabled="instrumental||lyricsLoading" @click="openLyricsAi"><svg class="lyrics-ai-wand-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="m7.1 24.9 15.7-15.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m7.1 24.9-2 2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m10.2 22.7-2-2" fill="none" opacity=".72" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/><path d="m24.1 3.1.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z" fill="currentColor"/><path d="m13.2 4.5.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".9"/><path d="m25.6 17.8.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".82"/></svg></button><label class="instrumental-toggle">纯音乐 <GlassSwitch v-model="form.instrumental" :disabled="ideaLoading"/></label></div></div><label v-if="activeMode!=='advanced'" class="instrumental-toggle">纯音乐 <GlassSwitch v-model="form.instrumental" :disabled="ideaLoading"/></label></div></div>
      </template>

      <div v-if="activeMode==='advanced'" class="advanced-only">
        <section class="field-card advanced-section advanced-lyrics-card" :class="{ 'is-collapsed': !advancedLyricsOpen }">
          <button type="button" class="advanced-section-toggle" :aria-expanded="advancedLyricsOpen" @click="advancedLyricsOpen=!advancedLyricsOpen">
            <span class="advanced-section-title"><strong>歌词</strong><small>{{form.prompt.length}} / 2000</small></span>
            <span class="advanced-section-tools"><span v-if="form.prompt.trim()" class="advanced-section-status">已填写</span><ArrowUp v-if="advancedLyricsOpen"/><ArrowDown v-else/></span>
          </button>
          <div v-show="advancedLyricsOpen" class="advanced-section-content advanced-lyrics-content" @click="closeLyricsTools" @keydown.esc="closeLyricsTools">
            <div class="advanced-lyrics-toolbar" @click.stop>
              <div class="lyrics-tools-shell">
                <button type="button" class="lyrics-tool-button" :class="{active:structureOpen}" aria-label="插入歌词结构" :aria-expanded="structureOpen" @click="structureOpen=!structureOpen;pinyinOpen=false"><List class="lyrics-tool-icon" aria-hidden="true"/>结构</button>
                <button type="button" class="lyrics-tool-button" :class="{active:pinyinOpen}" aria-label="歌词拼音转换" :aria-expanded="pinyinOpen" :disabled="!form.prompt.trim()||pinyinLoading" @click="pinyinOpen=!pinyinOpen;structureOpen=false"><span class="lyrics-tool-pinyin-glyph" aria-hidden="true"><b>A</b><i>文</i></span>{{pinyinLoading?'转换中':'拼音'}}</button>
                <div v-if="structureOpen" class="lyrics-tool-popover lyrics-structure-popover" role="menu"><button v-for="option in structureOptions" :key="option.marker" type="button" role="menuitem" @click="insertStructure(option.marker)">{{option.label}}</button></div>
                <div v-if="pinyinOpen" class="lyrics-tool-popover lyrics-pinyin-popover" role="menu"><div class="lyrics-popover-title">转写方式</div><div class="lyrics-dialect" role="group" aria-label="转写方式"><button type="button" :class="{active:pinyinDialect==='mandarin'}" :aria-pressed="pinyinDialect==='mandarin'" @click="pinyinDialect='mandarin'">普通话</button><button type="button" :class="{active:pinyinDialect==='cantonese'}" :aria-pressed="pinyinDialect==='cantonese'" @click="pinyinDialect='cantonese'">粤语</button></div><div class="lyrics-popover-title">选择转写比例</div><div class="lyrics-ratio-grid"><button v-for="ratio in pinyinRatios" :key="ratio" type="button" role="menuitem" :class="{active:pinyinRatio===ratio}" :disabled="pinyinLoading" @click="applyPinyin(ratio)">{{ratio}}%</button></div><button type="button" class="lyrics-popover-cancel" @click="pinyinOpen=false">取消</button></div>
              </div>
            </div>
            <el-input v-if="!ideaLoading" ref="promptInput" v-model="form.prompt" type="textarea" :rows="10" maxlength="2000" resize="none" placeholder="[Verse]\n在这里输入歌词…"/>
            <div v-else class="idea-skeleton" role="status" aria-label="正在生成歌词"><span class="idea-skeleton-line idea-skeleton-line-wide"></span><span class="idea-skeleton-line idea-skeleton-line-medium"></span><span class="idea-skeleton-line idea-skeleton-line-short"></span><span class="idea-skeleton-line idea-skeleton-line-tiny"></span></div>
            <div class="advanced-lyrics-footer" @click.stop>
              <div v-if="lyricsAiOpen" class="lyrics-ai-control" @click.stop>
                <div class="lyrics-ai-panel" role="region" aria-label="AI 生成歌词"><div class="lyrics-ai-chips-row"><button v-if="lyricsAiHasLeft" class="lyrics-ai-arrow" type="button" aria-label="向左查看更多标签" @click="scrollLyricsAiTags(-1)"><ArrowLeft/></button><div ref="lyricsAiTags" class="lyrics-ai-tags" @scroll="updateLyricsAiScroll"><button v-for="preset in lyricsAiPresets" :key="preset.label" type="button" class="lyrics-ai-chip" @click="pickLyricsAiPrompt(preset.value)">{{preset.label}}</button></div><button v-if="lyricsAiHasRight" class="lyrics-ai-arrow" type="button" aria-label="向右查看更多标签" @click="scrollLyricsAiTags(1)"><ArrowRight/></button><button class="lyrics-ai-close" type="button" aria-label="收起歌词写作栏" @click="closeLyricsAi"><Close/></button></div><div class="lyrics-ai-input-row"><span v-if="lyricsLoading" class="lyrics-ai-skeleton" role="status" aria-label="正在生成歌词"><span class="lyrics-ai-skeleton-bar"></span></span><input v-else ref="lyricsAiInput" v-model="lyricsAiInstruction" class="lyrics-ai-input" placeholder="写一首乡村歌曲" aria-label="歌词主题或要求" :disabled="lyricsLoading" @keydown.enter.exact.prevent="submitLyricsAi"/><button class="lyrics-ai-send" type="button" aria-label="AI 生成歌词" :disabled="lyricsLoading||!lyricsAiInstruction.trim()" @click="submitLyricsAi"><svg v-if="!lyricsLoading" class="lyrics-ai-wand-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="m7.1 24.9 15.7-15.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m7.1 24.9-2 2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m10.2 22.7-2-2" fill="none" opacity=".72" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/><path d="m24.1 3.1.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z" fill="currentColor"/><path d="m13.2 4.5.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".9"/><path d="m25.6 17.8.6 1.7 1.7.6-1.7.6-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".82"/></svg><span v-else class="lyrics-ai-loading-dot">…</span></button></div></div>
              </div>
              <div v-else class="lyrics-button-row"><button class="lyrics-generate-button" type="button" aria-label="AI 生成歌词" :disabled="instrumental||lyricsLoading" @click="openLyricsAi"><svg class="lyrics-ai-wand-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="m7.1 24.9 15.7-15.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m7.1 24.9-2 2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.8"/><path d="m10.2 22.7-2-2" fill="none" opacity=".72" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/><path d="m24.1 3.1.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z" fill="currentColor"/><path d="m13.2 4.5.6 1.7 1.7.6-1.7.6-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" fill="currentColor" opacity=".9"/><path d="m25.6 17.8.6 1.7 1.7.6-1.7.6-.6-1.7-1.7-.6-.6-1.7Z" fill="currentColor" opacity=".82"/></svg></button><label class="instrumental-toggle">纯音乐 <GlassSwitch v-model="form.instrumental" :disabled="ideaLoading"/></label></div>
            </div>
          </div>
        </section>

        <section class="field-card advanced-section advanced-style-section" :class="{ 'is-collapsed': !advancedStyleOpen }">
          <button type="button" class="advanced-section-toggle advanced-style-toggle" :aria-expanded="advancedStyleOpen" @click="advancedStyleOpen=!advancedStyleOpen"><span class="advanced-section-title"><strong>风格</strong></span><span class="advanced-section-tools"><ArrowUp v-if="advancedStyleOpen"/><ArrowDown v-else/></span></button>
          <div v-show="advancedStyleOpen" class="advanced-section-content advanced-style-content">
            <div class="advanced-style-editor"><el-input v-model="form.styleDescription" type="textarea" :rows="4" maxlength="1000" show-word-limit placeholder="描述歌曲的风格、情绪、人声、乐器和制作方向"/><div class="advanced-style-actions"><button type="button" class="mini-tool" @click="styleEnhancerOpen=!styleEnhancerOpen"><CollectionTag/>风格增强</button><button type="button" class="mini-tool" @click="openStylePicker()"><Search/>选择风格</button></div></div>
            <div v-if="styleEnhancerOpen" class="style-enhancer-panel"><div class="style-enhancer-presets"><button v-for="preset in (styleEnhancerExpanded ? styleEnhancerPresets : styleEnhancerPresets.slice(0,4))" :key="preset" type="button" :class="{active:styleEnhancerPrompt===preset}" @click="pickStyleEnhancerPreset(preset)">{{preset}}</button><button v-if="!styleEnhancerExpanded" type="button" class="style-enhancer-more" @click="styleEnhancerExpanded=true">向右查看更多标签 <ArrowRight/></button><button v-else type="button" class="style-enhancer-more" @click="styleEnhancerExpanded=false">收起风格写作栏 <ArrowUp/></button><button type="button" class="style-enhancer-close" aria-label="关闭风格增强" @click="styleEnhancerOpen=false">×</button></div><div class="style-enhancer-input"><el-input v-model="styleEnhancerPrompt" placeholder="风格标签或增强方向"/><button type="button" class="style-enhancer-submit" :disabled="assistLoading||(!styleEnhancerPrompt.trim()&&!form.styleDescription.trim())" @click="enhanceAdvancedStyle"><span v-if="assistLoading">...</span><ArrowUp v-else/></button></div></div>
            <div class="advanced-style-hint">风格内容将作为高级模式的最终风格输入，最多 1000 个字符。</div>
          </div>
        </section>

        <section class="field-card advanced-section advanced-title-section"><div class="field-header"><strong>歌曲标题</strong><span>选填</span></div><el-input v-model="form.songTitle" maxlength="120" placeholder="留空则由 AI 生成"/></section>

        <section class="field-card advanced-section" :class="{ 'is-collapsed': !advancedParamsOpen }">
          <button type="button" class="advanced-section-toggle" :aria-expanded="advancedParamsOpen" @click="advancedParamsOpen=!advancedParamsOpen"><span class="advanced-section-title"><strong>高级参数</strong><small>排除风格、人声、时长与生成强度</small></span><span class="advanced-section-tools"><ArrowUp v-if="advancedParamsOpen"/><ArrowDown v-else/></span></button>
          <div v-show="advancedParamsOpen" class="advanced-section-content advanced-params-content">
            <div class="advanced-param-block advanced-negative-style">
              <div class="advanced-param-heading"><span>排除风格</span><el-tooltip content="告诉 AI 不要加入的音乐风格或效果" placement="top"><InfoFilled/></el-tooltip></div>
              <div class="advanced-negative-editor"><el-input v-model="form.negativeTags" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="输入要排除的音乐风格，例如：电音、说唱、合成器（选填）"/><button type="button" class="advanced-inline-picker" @click="openStylePicker('negative')"><Search/>选择风格</button></div>
            </div>
            <div class="advanced-param-block">
              <div class="advanced-param-heading"><span>演唱性别</span><el-tooltip content="选择生成歌曲的人声性别偏好" placement="top"><InfoFilled/></el-tooltip></div>
              <div class="advanced-choice-row advanced-gender-choice"><button v-for="option in [{label:'不限',value:'AUTO'},{label:'男',value:'MALE'},{label:'女',value:'FEMALE'}]" :key="option.value" type="button" :class="{active:form.vocalType===option.value}" @click="form.vocalType=option.value">{{option.label}}</button></div>
            </div>
            <div class="advanced-param-block advanced-duration-block">
              <div class="advanced-param-heading"><span>时长</span><el-tooltip content="自动由模型决定，或指定目标时长" placement="top"><InfoFilled/></el-tooltip></div>
              <div class="advanced-choice-row"><button type="button" :class="{active:durationMode==='custom'}" @click="setDurationMode('custom')">自定义</button><button type="button" :class="{active:durationMode==='auto'}" @click="setDurationMode('auto')">自动</button></div>
              <el-input-number v-if="durationMode==='custom'" v-model="form.duration" class="advanced-duration-input" :min="1" :max="480" :step="1" controls-position="right"/>
            </div>
            <label class="advanced-range-row"><span class="advanced-range-label">随机度<el-tooltip content="控制结果的变化和实验性倾向" placement="top"><InfoFilled/></el-tooltip></span><GlassSlider v-model="form.weirdness" :min="0" :max="100" :step="1" :show-tooltip="false"/><output>{{form.weirdness}}%</output></label>
            <label class="advanced-range-row"><span class="advanced-range-label">风格影响<el-tooltip content="控制生成结果对风格标签的遵循程度" placement="top"><InfoFilled/></el-tooltip></span><GlassSlider v-model="form.styleWeight" :min="0" :max="100" :step="1" :show-tooltip="false"/><output>{{form.styleWeight}}%</output></label>
            <label class="advanced-range-row"><span class="advanced-range-label">音频影响<el-tooltip content="使用来源音频时，控制生成结果对来源音频的参考程度" placement="top"><InfoFilled/></el-tooltip></span><GlassSlider v-model="form.audioWeight" :min="0" :max="100" :step="1" :show-tooltip="false"/><output>{{form.audioWeight}}%</output></label>
            <div class="advanced-param-block advanced-max-row"><div class="advanced-max-label"><span>Max Mode</span><el-tooltip content="使用更多算力提升整首歌曲的一致性，消耗双倍积分" placement="top"><InfoFilled/></el-tooltip><em>双倍费用</em></div><GlassSwitch v-model="form.maxMode"/></div>
            <div class="advanced-param-block advanced-variety-block"><div class="advanced-param-heading"><span>多样性</span><el-tooltip content="仅 V6 系列模型可用；默认沿用模型自身设置" placement="top"><InfoFilled/></el-tooltip></div><div class="advanced-choice-row advanced-variety-choice"><button type="button" :class="{active:form.variety===null}" @click="form.variety=null">默认</button><button v-for="value in [0,1,2,3,4]" :key="value" type="button" :class="{active:form.variety===value}" @click="form.variety=value">{{value}}</button></div></div>
          </div>
        </section>
      </div>

      <div v-if="activeMode==='sound'" class="field-card style-card"><div class="field-header"><strong>风格</strong><button class="mini-tool" :disabled="assistLoading" @click="polishStyle"><CollectionTag/>增强风格</button></div><div class="chips"><button v-for="s in styles" :key="s" :class="{active:form.style===s}" @click="form.style=s">{{s}}</button></div><el-input v-model="form.negativeTags" class="style-input" placeholder="补充风格描述，例如：明亮、复古、电影感"/></div>

      <div v-if="activeMode==='sound'" class="field-card sound-card"><div class="field-header"><strong>音效设置</strong><span>短音效，最长约 20 秒</span></div><el-radio-group v-model="form.soundType"><el-radio-button value="单次">单次</el-radio-button><el-radio-button value="循环">循环</el-radio-button></el-radio-group><div class="sound-controls"><label>BPM<el-input-number v-model="form.soundBpm" :min="1" :max="240" controls-position="right"/></label><label>调性<el-select v-model="form.soundKey"><el-option v-for="key in ['任意','C','D','E','F','G','A','B']" :key="key" :label="key" :value="key"/></el-select></label></div></div>
      <div v-if="activeMode==='simple'" class="reference-section"><div class="prompt-helpers"><button @click="suggestIdea"><Refresh/>随机灵感</button><button @click="pastePrompt"><Document/>粘贴文本</button><button @click="form.prompt=''">清空内容</button></div><h3>风格选择</h3><div class="reference-chips"><button v-for="s in quickStyles" :key="s" :class="{active:form.style===s}" :aria-pressed="form.style===s" @click="form.style=s">{{s==='Pop'?'流行':s==='EDM'?'电子':s==='HipHop'?'嘻哈':s==='Rock'?'摇滚':s}}</button></div><h3>情绪氛围</h3><div class="reference-chips"><button v-for="m in quickMoods" :key="m" :class="{active:form.mood===m}" :aria-pressed="form.mood===m" @click="form.mood=m">{{m}}</button></div></div>
      <div class="generation-settings"><label>歌曲时长<span>{{activeMode==='advanced'&&form.duration?`${form.duration} 秒`:'模型自动'}} <button v-if="activeMode==='simple'" @click="chooseMode('advanced')">自定义</button></span></label><label>音乐模型<el-select v-model="form.model" aria-label="音乐模型"><el-option label="V6" value="suno-v6"/><el-option label="V6 Wild" value="suno-v6-wild"/><el-option label="V6 Mini" value="suno-v6-mini"/></el-select></label><label>音质<span>模型默认</span></label></div>
      <p v-if="(auth.user?.creditBalance||0)<generationCost" class="balance-warning" role="status">积分不足，需要 {{generationCost}} 积分。<router-link to="/profile">查看账户与积分</router-link></p>
      <details v-if="activeMode!=='advanced'" class="composer-extra-settings">
        <summary>更多创作设置</summary>
        <div class="max-mode-card"><div><strong>Max Mode</strong><small>更高的提示词控制力 · 开启后消耗 20 积分</small></div><GlassSwitch v-model="form.maxMode" aria-label="Max Mode" /></div>
      </details>


      <div v-if="task && ['WAITING','PROCESSING','UNCERTAIN','FAILED'].includes(task.status)" class="task-feedback" :class="`task-feedback-${task.status.toLowerCase()}`" role="status" aria-live="polite"><strong>{{task.status==='WAITING'?'任务已创建':task.status==='PROCESSING'?'正在生成音乐':task.status==='UNCERTAIN'?'提交状态待核实':'生成失败'}}</strong><span>{{task.errorMessage|| (task.status==='UNCERTAIN'?'请先检查作品库，不要重复提交':'系统会自动查询生成结果')}}</span></div>
      <footer class="generate-footer"><button class="clear-button" title="清空创作表单" aria-label="清空创作表单" @click="clearForm"><Delete/></button><el-button class="generate-button" type="primary" size="large" :loading="loading" :disabled="!form.prompt.trim()||loading||(auth.user?.creditBalance||0)<generationCost||!!(task&&['WAITING','PROCESSING','UNCERTAIN'].includes(task.status))||((activeMode!=='simple'||simpleLyricsOpen)&&form.lyricsMode==='USER'&&!instrumental&&!form.lyrics.trim())" @click="submit"><MagicStick/>生成歌曲 <small>{{generationCost}} 积分 / 2 首</small></el-button></footer>
    </section>

     <section class="library-panel" data-lg-scene="library"><div class="workspace-heading"><h2>我的作品</h2><small>{{libraryTotal}} 首</small></div><header class="library-header"><div class="library-search"><el-input v-model="libraryQuery" aria-label="搜索我的作品" placeholder="搜索作品或风格…" clearable><template #prefix><el-icon><Search/></el-icon></template></el-input></div><nav class="library-tabs" aria-label="作品筛选"><button v-for="tab in ['全部','最近生成','我收藏的','创作中','上传','翻唱']" :key="tab" :class="{active:activeFilter===tab}" :aria-pressed="activeFilter===tab" @click="activeFilter=tab">{{tab}}</button></nav></header><div class="clip-list" data-lg-scroll :aria-busy="libraryLoading"><template v-if="libraryLoading"><div v-for="n in 5" :key="n" class="track-skeleton" role="status" aria-label="正在加载作品"/></template><template v-else><article v-for="track in visibleTracks" :key="track.id" class="clip-card" :class="{selected:player.track?.id===track.id}"><button class="clip-main" @click="playTrack(track)"><div class="clip-cover"><img v-if="track.coverUrl" :src="track.coverUrl" alt=""/><span v-else>♪</span><b v-if="track.duration">{{Math.floor(track.duration/60)}}:{{String(Math.floor(track.duration%60)).padStart(2,'0')}}</b></div><div class="clip-copy"><div class="clip-title"><strong>{{track.title||'未命名作品'}}</strong><span v-if="track.modelVersion">{{track.modelVersion.replace('suno-','').toUpperCase()}}</span></div><p>{{track.styleTags||'现代流行音乐'}}</p><small>{{new Date(track.createdAt).toLocaleString()}}</small></div></button><GlassDropdown trigger="click" @command="(command:string)=>command==='favorite'?toggleFavorite(track):command==='delete'?removeTrack(track):undefined"><button class="clip-more" aria-label="更多操作" @click.stop><MoreFilled/></button><template #dropdown><GlassDropdownMenu><GlassDropdownItem command="favorite">{{track.favorite?'取消收藏':'收藏作品'}}</GlassDropdownItem><GlassDropdownItem v-if="track.audioUrl"><a :href="`/api/v1/music-library/${track.id}/download`">下载音乐</a></GlassDropdownItem><GlassDropdownItem command="delete" divided>删除作品</GlassDropdownItem></GlassDropdownMenu></template></GlassDropdown></article><div v-if="!visibleTracks.length" class="library-empty"><Headset/><strong>{{libraryQuery||activeFilter!=='全部'?'没有符合条件的作品':'暂无作品'}}</strong><p>{{libraryQuery||activeFilter!=='全部'?'试试其他筛选条件；风格与创作中筛选仅作用于当前页。':'生成歌曲后，作品将展示在此处。'}}</p></div></template></div><footer class="library-pagination" v-if="libraryTotal>12"><button :disabled="libraryPage<=1" @click="libraryPage--;pageJump=libraryPage;loadLibrary()">‹</button><span>第 {{libraryPage}} 页</span><el-input v-model.number="pageJump" class="page-jump" size="small" aria-label="跳转页码"/><button @click="jumpPage">跳转</button><button :disabled="libraryPage*12>=libraryTotal" @click="libraryPage++;pageJump=libraryPage;loadLibrary()">›</button></footer></section>

    <el-dialog v-model="stylePickerOpen" title="选择风格" width="min(860px, 94vw)" class="style-picker-dialog" @closed="stylePickerSelection=[]"><div class="style-picker"><div class="style-picker-toolbar"><el-input v-model="stylePickerSearch" clearable placeholder="搜索中文或英文标签"><template #prefix><Search/></template></el-input><label>自动翻译英文 <GlassSwitch v-model="stylePickerAutoTranslate"/></label></div><div class="style-picker-categories"><button v-for="category in advancedStyleCategories" :key="category.name" type="button" :class="{active:stylePickerCategory===category.name}" @click="stylePickerCategory=category.name;stylePickerGroup=''">{{category.name}}</button></div><div class="style-picker-groups"><button type="button" :class="{active:!stylePickerGroup}" @click="stylePickerGroup=''">全部</button><button v-for="group in activeStyleCategory.groups" :key="group.name" type="button" :class="{active:stylePickerGroup===group.name}" @click="stylePickerGroup=group.name">{{group.name}}</button></div><div class="style-picker-tags"><button v-for="tag in activeStyleTags" :key="tag.en" type="button" :class="{selected:stylePickerSelection.includes(tag.en)}" @click="toggleStyleTag(tag.en)"><span>{{stylePickerAutoTranslate?tag.zh:tag.en}}</span><small v-if="stylePickerAutoTranslate">{{tag.en}}</small></button><div v-if="!activeStyleTags.length" class="style-picker-empty">没有找到匹配的风格标签</div></div><footer class="style-picker-footer"><span>已选 {{stylePickerSelectedCount}} 个 · 共 {{ADVANCED_STYLE_TAG_TOTAL}} 个标签</span><div><el-button text @click="clearStyleSelection" :disabled="!stylePickerSelection.length">清空</el-button><el-button type="primary" @click="applyStyleSelection" :disabled="!stylePickerSelection.length">确认</el-button></div></footer></div></el-dialog>
    <el-dialog v-model="pickerOpen" title="选择已有音频" width="min(940px, 94vw)" class="source-picker-dialog" @closed="pickerSelection=null"><div class="source-picker-shell"><div class="source-picker-toolbar"><el-input v-model="libraryQuery" clearable placeholder="搜索歌名或风格…"><template #prefix><Search/></template></el-input><nav class="source-picker-filters"><button v-for="tab in ['全部','收藏','生成','上传','翻唱']" :key="tab" type="button" :class="{active:activeFilter===tab}" @click="activeFilter=tab">{{tab}}</button></nav></div><div v-loading="libraryLoading" class="source-picker-grid"><button v-for="track in libraryItems" :key="track.id" type="button" class="source-picker-card" :class="{selected:pickerSelection?.id===track.id}" @click="chooseTrack(track)"><span class="source-picker-cover"><img v-if="track.coverUrl" :src="track.coverUrl" alt=""/><b v-else>♪</b></span><span class="source-picker-copy"><strong>{{track.title||'未命名作品'}}</strong><small><span class="source-picker-clock">◷</span>{{new Date(track.createdAt).toLocaleDateString()}}</small></span><span class="source-picker-radio"></span></button><div v-if="!libraryLoading&&!libraryItems.length" class="picker-empty">音乐库还没有可续写的作品。</div></div><footer v-if="libraryTotal>12" class="source-picker-pagination"><button type="button" :disabled="libraryPage<=1" @click="libraryPage--;pageJump=libraryPage;loadLibrary()">‹ 上一页</button><span class="source-picker-page-active">{{libraryPage}}</span><button type="button" :disabled="libraryPage*12>=libraryTotal" @click="libraryPage++;pageJump=libraryPage;loadLibrary()">下一页 ›</button><span class="source-picker-jump-label">页</span><el-input v-model.number="pageJump" size="small" aria-label="跳转页码"/><button type="button" class="source-picker-jump" @click="jumpPage">跳转</button></footer><footer class="source-picker-actions"><button type="button" class="source-picker-cancel" @click="pickerOpen=false;pickerSelection=null">取消</button><button type="button" class="source-picker-confirm" :disabled="!pickerSelection||voiceCreating" @click="confirmTrackSelection">确认使用</button></footer></div></el-dialog>
    <el-dialog v-model="voiceOpen" title="" width="min(960px, 94vw)" class="voice-clone-dialog" modal-class="voice-clone-overlay" :class="`voice-clone-${voiceStep}`" :show-close="false" :close-on-click-modal="false" align-center destroy-on-close>
      <div class="voice-clone-shell">
        <template v-if="voiceStep==='choose'">
          <header class="voice-clone-head"><h2>选择人声音色（新模式）</h2><button type="button" aria-label="关闭" @click="closeVoiceDialog"><Close/></button></header>
          <div class="voice-search-row"><el-input v-model="voiceSearch" clearable placeholder="搜索音色名称或来源文件"><template #prefix><Search/></template></el-input><button type="button" class="voice-refresh" :disabled="voiceLoading" aria-label="刷新音色列表" @click="loadVoices(true)"><Refresh/></button></div>
          <div class="voice-choice-grid"><button type="button" class="voice-choice-card" @click="beginVoiceCreation"><span class="voice-choice-icon"><span>+</span></span><strong>创建新音色</strong></button><button type="button" class="voice-choice-card" @click="openLibrary"><span class="voice-choice-icon"><Headset/></span><strong>选择已有音频</strong></button></div>
          <p v-if="voiceLoading" class="voice-section-label" role="status">正在加载音色列表…</p>
          <p v-if="voiceListError" class="voice-section-label" role="status">{{voiceListError}}</p>
          <h3 v-if="filteredVoices.length||(!voiceLoading&&!voiceListError)" class="voice-section-label">可用 {{filteredVoices.length}}</h3>
          <div v-if="filteredVoices.length" class="voice-list voice-list-large"><article v-for="voice in filteredVoices" :key="voice.voice_id||voice.id" class="voice-item"><button type="button" class="voice-source-play" :disabled="!voiceSourceUrl(voice)" :aria-label="`试听源音频 ${voice.title||voice.name||'未命名音色'}`" @click="playVoiceSource(voice)"><VideoPause v-if="voiceIsPlaying(voice)"/><VideoPlay v-else/></button><span class="voice-avatar"><img v-if="voice.cover_url||voice.image_url" :src="voice.cover_url||voice.image_url" alt=""/><Mic v-else/></span><button type="button" class="voice-item-copy" @click="chooseVoice(voice)"><strong>{{voice.title||voice.name||'未命名音色'}}</strong><small>{{voiceSourceLabel(voice)}}</small></button><b class="voice-available">● 可用</b></article></div>
          <div v-else-if="!voiceLoading&&!voiceListError" class="voice-empty"><Mic/><strong>还没有可用音色</strong><p>创建一个音色后，它会出现在这里。</p></div>
        </template>
        <template v-else-if="voiceStep==='name'">
          <header class="voice-clone-head"><h2>为这个人声命名</h2><button type="button" aria-label="关闭" @click="closeVoiceDialog"><Close/></button></header>
          <div class="voice-name-form"><label for="voice-name">音色名称 <em>必填</em></label><el-input id="voice-name" v-model="voiceName" maxlength="24" show-word-limit autofocus placeholder="例如：女声-流行-中文"/><p>这个名字会显示在音色列表和作品里，之后可以改。</p><p v-if="voiceFromClip&&voiceClip" class="voice-source-hint">来自作品：{{voiceClip.title||'未命名作品'}}</p><div class="voice-step-actions"><el-button @click="returnToVoiceList">取消</el-button><el-button type="primary" :loading="voiceCreating" :disabled="!voiceName.trim()||voiceCreating" @click="voiceFromClip?beginVoiceCreationFromClip():continueVoiceNaming()">{{voiceFromClip?'开始创建':'下一步：上传源声'}} <ArrowRight/></el-button></div></div>
        </template>
        <template v-else-if="voiceStep==='processing'">
          <header class="voice-clone-head"><h2>正在创建音色</h2><button type="button" aria-label="关闭" @click="closeVoiceDialog"><Close/></button></header>
          <div class="voice-processing-panel" role="status"><Refresh v-if="voiceCreating" class="voice-processing-spinner"/><strong>{{voiceProcessingError?'音色尚未就绪':'正在处理人声样本'}}</strong><p>{{voiceProcessingError||'音色可用后会自动进入下一步。'}}</p></div>
          <div class="voice-step-actions voice-success-actions"><el-button @click="voiceOpen=false">稍后再说</el-button><el-button v-if="voiceProcessingError" type="primary" @click="returnToVoiceList">查看音色列表</el-button></div>
        </template>
        <template v-else-if="voiceStep==='success'">
          <header class="voice-clone-head"><h2>音色创建成功</h2><button type="button" aria-label="关闭" @click="closeVoiceDialog"><Close/></button></header>
          <div class="voice-success-panel"><strong>音色创建成功</strong><b>{{voiceName}}</b><small>现在可以使用这个音色进行创作。</small></div>
          <div class="voice-step-actions voice-success-actions"><el-button @click="voiceOpen=false">稍后再说</el-button><el-button type="primary" @click="beginVoiceComposition">开始创作 <ArrowRight/></el-button></div>
        </template>
        <template v-else>
          <header class="voice-clone-head"><h2>上传或录制源声</h2><button type="button" aria-label="关闭" @click="closeVoiceDialog"><Close/></button></header>
          <div class="voice-upload-panel">
            <div class="voice-upload-intro"><strong>添加你的声音样本</strong><p>录制或上传一段样本，我们会用它来影响生成歌曲的人声表现。</p></div>
            <div class="voice-dropzone" :class="{dragging:voiceDragging,recording:voiceRecording}" @dragover.prevent="voiceDragging=true" @dragleave.prevent="voiceDragging=false" @drop.prevent="dropVoiceSample">
              <template v-if="voiceRecording"><VideoPause/><strong>正在录制 {{Math.floor(voiceRecordingSeconds/60)}}:{{String(voiceRecordingSeconds%60).padStart(2,'0')}}</strong><small>建议录制 10 秒以上，完成后点击停止</small></template>
              <template v-else-if="voiceFile"><VideoPlay/><strong>{{voiceFile.name}}</strong><small>{{Math.round(voiceSampleDuration)}}秒 · 已准备好上传</small><button type="button" class="voice-clear-sample" @click.stop="resetVoiceSample">重新选择</button></template>
              <template v-else><UploadFilled/><strong>将音频文件拖拽到此处</strong><small>或使用下方按钮添加声音样本</small></template>
            </div>
            <div class="voice-upload-buttons"><el-button type="primary" plain :loading="voiceRecordingStarting" :disabled="voiceSampleChecking||voiceCreating" @click="voiceRecording?stopVoiceRecording():startVoiceRecording()"><VideoPause v-if="voiceRecording"/> <VideoPlay v-else/> {{voiceRecording?'停止':'录制'}}</el-button><el-button plain :disabled="voiceRecording||voiceSampleChecking||voiceCreating" @click="triggerVoiceUpload"><UploadFilled/>上传音频</el-button></div>
            <p class="voice-upload-format">支持 MP3、WAV、M4A — 最大 10 MB</p>
            <input ref="voiceInput" type="file" accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4" hidden @change="chooseVoiceFile"/>
            <audio v-if="voiceSampleUrl" class="voice-sample-audio" :src="voiceSampleUrl" controls preload="metadata"/>
            <p v-if="voiceSampleChecking" class="voice-sample-status" role="status">正在读取音频时长…</p><p v-if="voiceSampleError" class="voice-sample-error" role="alert">{{voiceSampleError}}</p>
            <div class="voice-upload-notice"><p>演唱版权歌曲，请使用强化克隆，否则会失败，未演唱版权歌曲选择「开始克隆」即可，效果是一样的</p><p>推荐歌曲：两只老虎 —— 用低音、正常音、高音与假声分别唱一遍</p><p>至少录制 10 秒钟</p></div>
            <div class="voice-step-actions voice-upload-actions"><el-button @click="backFromVoiceAudio">上一步</el-button><div><el-button type="primary" :loading="voiceCreating" :disabled="!voiceCanSubmit" @click="createVoiceProfile(false)">开始克隆</el-button><el-button class="voice-enhanced-button" :loading="voiceCreating" :disabled="!voiceCanSubmit" @click="createVoiceProfile(true)">强化克隆 ¥10/次</el-button></div></div>
          </div>
        </template>
      </div>
    </el-dialog>
    <el-dialog v-model="uploadSourceOpen" title="上传歌曲" width="min(620px, 92vw)" class="upload-source-dialog"><div class="upload-source-intro">先选择你要使用的音频来源。</div><div class="upload-source-options"><button type="button" class="upload-source-option" @click="openLibrary"><span class="upload-source-option-icon"><Headset/></span><span class="upload-source-option-copy"><strong>选择已有音乐</strong><small>从当前工作区挑选一首已经生成的歌曲。</small></span><ArrowRight class="upload-source-option-arrow"/></button><button type="button" class="upload-source-option" :disabled="uploadLoading" @click="triggerLocalSourceUpload"><span class="upload-source-option-icon"><UploadFilled/></span><span class="upload-source-option-copy"><strong>上传一首歌</strong><small>选择一个音频文件上传。</small></span><ArrowRight class="upload-source-option-arrow"/></button><button type="button" class="upload-source-option upload-source-option-paid" :disabled="enhancedUploadLoading" @click="triggerEnhancedUpload"><span class="upload-source-option-icon"><CollectionTag/></span><span class="upload-source-option-copy"><strong>强化上传 <em>¥10/次</em></strong><small>支持绝大部分音乐上传，上传失败不收费，质保 5 天，处理前可随时取消退款。</small></span><span class="upload-source-option-state">{{enhancedUploadLoading?'处理中…':'增强音频'}}</span></button></div><div v-if="enhancedUploadTaskId" class="upload-source-status">强化上传任务 {{enhancedUploadTaskId }} 正在处理，完成后会自动绑定为来源音频。</div></el-dialog>
  </div>
</template>



