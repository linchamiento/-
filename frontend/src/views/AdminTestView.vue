<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, CircleCheckFilled, InfoFilled, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { sunoApi } from '../api/suno'
import { sunoApiCatalog, type SunoApiCostType } from '../data/sunoApiCatalog'

const router = useRouter()
const balanceLoading = ref(false)
const balanceResult = ref<unknown>(null)
const balanceError = ref('')
const searchText = ref('')
const selectedCategory = ref('全部')
const selectedCost = ref<'all' | SunoApiCostType>('all')
type ApiTestState = { loading: boolean; result: unknown; error: string }
const apiTestStates = ref<Record<string, ApiTestState>>({})
const apiTestInputs = ref<Record<string, string>>({})
const apiTestBodies = ref<Record<string, string>>({})

// 这些筛选只读取前端打包的文档目录，不会调用任何生成接口，也不会产生费用。
const categories = computed(() => ['全部', ...new Set(sunoApiCatalog.map(item => item.category))])
const costFilters: Array<{ key: 'all' | SunoApiCostType; label: string }> = [
  { key: 'all', label: '全部费用' },
  { key: 'free', label: '免费' },
  { key: 'quota', label: '免费额度' },
  { key: 'charged', label: '收费' }
]

const filteredCatalog = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return sunoApiCatalog.filter(item => {
    const matchesCategory = selectedCategory.value === '全部' || item.category === selectedCategory.value
    const matchesCost = selectedCost.value === 'all' || item.costType === selectedCost.value
    const searchable = `${item.title} ${item.path} ${item.description} ${item.fee}`.toLowerCase()
    return matchesCategory && matchesCost && (!keyword || searchable.includes(keyword))
  })
})

const catalogCounts = computed(() => ({
  total: sunoApiCatalog.length,
  free: sunoApiCatalog.filter(item => item.costType === 'free').length,
  quota: sunoApiCatalog.filter(item => item.costType === 'quota').length,
  charged: sunoApiCatalog.filter(item => item.costType === 'charged').length
}))

const prettyBalance = computed(() => balanceResult.value ? JSON.stringify(balanceResult.value, null, 2) : '')
const balanceSummary = computed(() => {
  const payload = balanceResult.value as {
    data?: {
      user?: { username?: string; quota?: number; used_quota?: number; request_count?: number }
      balance?: { effective_amount?: number }
    }
  } | null
  const user = payload?.data?.user
  if (!user) return null
  const total = Number(user.quota)
  const used = Number(user.used_quota)
  return {
    username: user.username || '当前账户',
    total: Number.isFinite(total) ? total : null,
    used: Number.isFinite(used) ? used : null,
    remaining: Number.isFinite(total) && Number.isFinite(used) ? Math.max(total - used, 0) : null,
    requests: Number.isFinite(Number(user.request_count)) ? Number(user.request_count) : null,
    money: Number.isFinite(Number(payload?.data?.balance?.effective_amount)) ? Number(payload?.data?.balance?.effective_amount) : null
  }
})

function costLabel(type: SunoApiCostType) {
  if (type === 'free') return '免费'
  if (type === 'quota') return '免费额度内'
  if (type === 'charged') return '可能收费'
  return '按文档确认'
}

function formatQuota(value: number | null) {
  return value === null ? '--' : new Intl.NumberFormat('zh-CN').format(value)
}

function apiItemKey(item: { method: string; path: string }) {
  return `${item.method}-${item.path}`
}

function isTestable(item: { costType: SunoApiCostType }) {
  // 只有文档标记为免费或免费额度内的接口允许发起测试，收费接口不会进入请求函数。
  return item.costType === 'free' || item.costType === 'quota'
}

function pathParameterNames(path: string) {
  return path.match(/\{[^}]+\}|:[A-Za-z_][\w-]*/g) ?? []
}

function testInputValue(item: { method: string; path: string }) {
  return apiTestInputs.value[apiItemKey(item)] ?? ''
}

function setTestInput(item: { method: string; path: string }, value: string) {
  apiTestInputs.value[apiItemKey(item)] = value
}

function defaultTestBody(item: { path: string }) {
  if (item.path === '/api/lyrics/generate') return '{\n  "model": "suno-v6",\n  "prompt": "一首关于夏天的短歌词"\n}'
  if (item.path === '/api/lyrics/timeline') return '{\n  "model": "suno-v6",\n  "song_id": ""\n}'
  if (item.path === '/api/music/query') return '{\n  "model": "suno-v6",\n  "song_ids": ""\n}'
  if (item.path === '/api/music/boost-style') return '{\n  "model": "suno-v6",\n  "originalTags": "流行、温柔、钢琴"\n}'
  if (item.path === '/api/prompts/suggestions') return '{\n  "model": "suno-v6"\n}'
  if (item.path === '/api/prompts/library') return '{\n  "model": "suno-v6"\n}'
  return '{}'
}

function testBodyValue(item: { method: string; path: string }) {
  const key = apiItemKey(item)
  return apiTestBodies.value[key] ?? defaultTestBody(item)
}

function setTestBody(item: { method: string; path: string }, value: string) {
  apiTestBodies.value[apiItemKey(item)] = value
}

function eventValue(event: Event) {
  return (event.target as HTMLInputElement).value
}

function testState(item: { method: string; path: string }) {
  return apiTestStates.value[apiItemKey(item)]
}

function responseSummary(value: unknown) {
  if (value === null || value === undefined) return '接口返回为空。'
  if (typeof value !== 'object') return `接口返回：${String(value)}`
  const record = value as Record<string, unknown>
  if (record.success === false) return `接口返回失败：${String(record.message ?? '请查看原始返回。')}`
  if (typeof record.message === 'string' && record.message) return `接口消息：${record.message}`
  if (record.data && typeof record.data === 'object') {
    const fields = Object.keys(record.data as Record<string, unknown>).slice(0, 5)
    return fields.length ? `接口已返回 data，包含：${fields.join('、')}` : '接口已返回 data。'
  }
  return `接口已返回数据（${Object.keys(record).slice(0, 5).join('、') || '无字段'}）。`
}

function prettyResponse(value: unknown) {
  if (typeof value === 'string') return value
  try { return JSON.stringify(value, null, 2) } catch { return String(value) }
}

function resolveTestPath(item: { method: string; path: string }) {
  const placeholders = pathParameterNames(item.path)
  if (!placeholders.length) return item.path
  const values = testInputValue(item).split(',').map(value => value.trim()).filter(Boolean)
  if (values.length < placeholders.length) {
    throw new Error(`请填写路径参数：${placeholders.join('、')}`)
  }
  let index = 0
  return item.path.replace(/\{[^}]+\}|:[A-Za-z_][\w-]*/g, () => encodeURIComponent(values[index++]))
}

async function runApiTest(item: { method: string; path: string; costType: SunoApiCostType }) {
  if (!isTestable(item)) return
  const key = apiItemKey(item)
  const state: ApiTestState = { loading: true, result: null, error: '' }
  apiTestStates.value[key] = state
  try {
    await sunoApi.operations()
    const request: { method: string; path: string; body?: unknown } = {
      method: item.method,
      path: resolveTestPath(item)
    }
    if (item.method !== 'GET') {
      const bodyText = testBodyValue(item).trim()
      request.body = bodyText ? JSON.parse(bodyText) : undefined
    }
    state.result = await sunoApi.execute(request)
    ElMessage.success(item.costType === 'quota' ? '测试完成，可能消耗了免费额度' : '免费接口测试完成')
  } catch (error: unknown) {
    const response = (error as { response?: { status?: number; data?: unknown } }).response
    state.result = response?.data ?? null
    state.error = response?.status
      ? `HTTP ${response.status}：${responseSummary(response.data)}`
      : (error instanceof Error ? error.message : '请求失败，请查看原始返回。')
  } finally {
    state.loading = false
  }
}

async function checkBalance() {
  balanceLoading.value = true
  balanceError.value = ''
  try {
    // 先访问只读目录，让后端下发 XSRF-TOKEN，避免新标签页第一次 POST 被 CSRF 拦截。
    await sunoApi.operations()
    balanceResult.value = await sunoApi.execute({ method: 'GET', path: '/api/user/balance' })
    ElMessage.success('余额查询成功，没有创建生成任务')
  } catch (error: unknown) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } }).response
    const status = response?.status
    const message = response?.data?.message
    if (status === 401) balanceError.value = '查询失败（HTTP 401）：登录状态已失效，请刷新页面后重新登录。'
    else if (status === 403) balanceError.value = '查询失败（HTTP 403）：CSRF 校验未通过，请刷新页面后重试。'
    else if (message) balanceError.value = `查询失败（HTTP ${status ?? '未知'}）：${message}`
    else balanceError.value = '查询失败：请检查后端状态、登录状态和 SUNO_API_KEY 配置。'
  } finally {
    balanceLoading.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <main class="admin-page">
    <div class="admin-page-inner">
      <button class="admin-back" type="button" @click="goBack">
        <ArrowLeft /> 返回上一页
      </button>

      <section class="admin-hero">
        <div>
          <span class="admin-kicker">TEST ADMIN · SUNO API CATALOG</span>
          <h1>SUNO_API_KEY<br /><em>全接口目录</em></h1>
          <p>已按 <code>doc/suno-api-docs</code> 整理当前总览和接口文档。每一项都写明用途、请求方式、接口地址和费用口径；真实 Key 仍只留在后端。</p>
        </div>
        <div class="admin-hero-mark" aria-hidden="true"><Search /></div>
      </section>

      <section class="admin-notice">
        <InfoFilled />
        <div>
          <strong>先看这里：查询、生成、下载的费用不同</strong>
          <p>“免费”和“免费额度内”接口可以在卡片里测试；免费额度接口可能消耗额度。收费接口只展示说明，测试按钮会被禁止，不会误扣费。</p>
        </div>
      </section>

      <section class="admin-balance-card">
        <div>
          <span class="admin-section-label">最常用的免费查询</span>
          <h2>查账户余额</h2>
          <p>只调用 <code>GET /api/user/balance</code>，不会生成音乐，也不会扣费。</p>
        </div>
        <el-button type="primary" :loading="balanceLoading" @click="checkBalance">查询余额</el-button>
        <div v-if="balanceSummary" class="balance-summary">
          <div class="balance-primary">
            <span>剩余额度</span>
            <strong>{{ formatQuota(balanceSummary.remaining) }}</strong>
            <small>{{ balanceSummary.username }}</small>
          </div>
          <div class="balance-metrics">
            <div><span>总额度</span><b>{{ formatQuota(balanceSummary.total) }}</b></div>
            <div><span>已使用</span><b>{{ formatQuota(balanceSummary.used) }}</b></div>
            <div v-if="balanceSummary.requests !== null"><span>请求次数</span><b>{{ formatQuota(balanceSummary.requests) }}</b></div>
            <div v-if="balanceSummary.money !== null"><span>账户余额</span><b>¥ {{ balanceSummary.money.toFixed(2) }}</b></div>
          </div>
          <details v-if="prettyBalance" class="balance-raw">
            <summary>查看原始返回</summary>
            <pre class="balance-result">{{ prettyBalance }}</pre>
          </details>
        </div>
        <p v-if="balanceError" class="balance-error">{{ balanceError }}</p>
      </section>

      <section class="catalog-section">
        <div class="catalog-head">
          <div>
            <span class="admin-section-label">DOCUMENT INDEX</span>
            <h2>全部接口 <small>{{ filteredCatalog.length }} / {{ catalogCounts.total }}</small></h2>
            <p>数据来自项目文档目录；接口说明与费用以对应 Markdown 文档和后台实时配置为准。</p>
          </div>
          <div class="catalog-stats" aria-label="接口费用统计">
            <span><b>{{ catalogCounts.free }}</b> 免费</span>
            <span><b>{{ catalogCounts.quota }}</b> 有额度</span>
            <span><b>{{ catalogCounts.charged }}</b> 可能收费</span>
          </div>
        </div>

        <div class="catalog-toolbar">
          <el-input v-model="searchText" clearable placeholder="搜索接口名称、路径或功能" class="catalog-search">
            <template #prefix><Search /></template>
          </el-input>
          <div class="category-tabs" role="tablist" aria-label="接口分类">
            <button v-for="category in categories" :key="category" type="button" :class="{ active: selectedCategory === category }" @click="selectedCategory = category">{{ category }}</button>
          </div>
          <div class="cost-tabs" role="tablist" aria-label="费用筛选">
            <button v-for="filter in costFilters" :key="filter.key" type="button" :class="{ active: selectedCost === filter.key }" @click="selectedCost = filter.key">{{ filter.label }}</button>
          </div>
        </div>

        <div v-if="filteredCatalog.length" class="catalog-grid">
          <article v-for="item in filteredCatalog" :key="`${item.method}-${item.path}`" class="catalog-card">
            <div class="catalog-card-top">
              <div class="catalog-meta">
                <span class="method" :class="item.method.toLowerCase()">{{ item.method }}</span>
                <span class="catalog-category">{{ item.category }}</span>
              </div>
              <span class="cost-tag" :class="item.costType"><CircleCheckFilled /> {{ costLabel(item.costType) }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <code class="catalog-path">{{ item.path }}</code>
            <p class="catalog-description">{{ item.description }}</p>
            <div class="catalog-fee"><span>费用</span><strong>{{ item.fee }}</strong></div>
            <div class="catalog-source">文档：{{ item.sourceFile }}</div>
            <div v-if="isTestable(item)" class="api-test-box">
              <details v-if="pathParameterNames(item.path).length || item.method !== 'GET'" class="test-request">
                <summary>请求参数（可选）</summary>
                <label v-if="pathParameterNames(item.path).length">
                  路径参数（按顺序填写，用逗号分隔）
                  <input :value="testInputValue(item)" :placeholder="pathParameterNames(item.path).join('、')" @input="setTestInput(item, eventValue($event))" />
                </label>
                <label v-if="item.method !== 'GET'">
                  请求 JSON
                  <textarea :value="testBodyValue(item)" spellcheck="false" @input="setTestBody(item, eventValue($event))" />
                </label>
              </details>
              <button class="api-test-button" type="button" :disabled="testState(item)?.loading" @click="runApiTest(item)">
                {{ testState(item)?.loading ? '测试中…' : '测试 API' }}
              </button>
              <div v-if="testState(item)" class="api-test-response" :class="{ failed: !!testState(item)?.error }">
                <strong>{{ testState(item)?.error || responseSummary(testState(item)?.result) }}</strong>
                <details v-if="testState(item)?.result !== null && testState(item)?.result !== undefined" class="api-raw-response">
                  <summary>查看原始返回</summary>
                  <pre>{{ prettyResponse(testState(item)?.result) }}</pre>
                </details>
              </div>
            </div>
            <div v-else class="paid-test-lock">付费接口，已禁止测试</div>
          </article>
        </div>
        <div v-else class="catalog-empty">没有匹配的接口。换一个关键词，或把筛选改成“全部”。</div>
      </section>

      <section class="admin-boundary">
        <strong>页面边界</strong>
        <p>免费和免费额度接口提供测试按钮与原始返回；付费接口只有说明，不会提供测试按钮。带路径参数或请求体的接口需要先填写参数，空参数通常会返回接口自己的校验提示。</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.admin-page{height:100%;overflow:auto;background:var(--bg);color:var(--text)}
.admin-page-inner{width:min(1180px,calc(100% - 64px));margin:0 auto;padding:30px 0 96px}
.admin-back{display:inline-flex;align-items:center;gap:7px;padding:0;border:0;background:transparent;color:var(--muted);font-size:13px;transition:color .2s ease}.admin-back:hover{color:var(--text)}.admin-back svg{width:16px}
.admin-hero{display:flex;align-items:center;justify-content:space-between;gap:32px;padding:38px 0 34px;border-bottom:1px solid var(--border)}
.admin-kicker,.admin-section-label{display:block;color:#4a78b8;font:600 11px/1.4 Consolas,monospace;letter-spacing:.12em;text-transform:uppercase}
.admin-hero h1{margin:13px 0 14px;font:700 clamp(38px,5vw,66px)/1.03 "Microsoft YaHei",sans-serif;letter-spacing:-.065em}.admin-hero h1 em{font-style:normal;color:#4a78b8}.admin-hero p{max-width:680px;margin:0;color:var(--muted);font-size:14px;line-height:1.8}.admin-hero p code{color:#4a78b8}
.admin-hero-mark{display:grid;place-items:center;width:136px;height:136px;flex:none;border:1px solid #b9c9dd;border-radius:32px;background:#edf3fb;color:#4a78b8;transform:rotate(5deg)}.admin-hero-mark svg{width:55px;height:55px;transform:rotate(-5deg)}
.admin-notice,.admin-balance-card,.admin-boundary{display:flex;align-items:flex-start;gap:14px;margin-top:24px;padding:18px 20px;border:1px solid var(--border);border-radius:12px;background:#fff;box-shadow:var(--shadow-soft)}
.admin-notice{border-left:3px solid #4a78b8;background:#f5f8fc}.admin-notice>svg{width:19px;flex:none;margin-top:2px;color:#4a78b8}.admin-notice strong{font-size:14px}.admin-notice p,.admin-boundary p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.7}
.admin-balance-card{position:relative;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:22px 24px;background:#111318;color:#fff;border-color:#111318}.admin-balance-card .admin-section-label{color:#a9c2df}.admin-balance-card h2{margin:7px 0 4px;font-size:21px}.admin-balance-card p{margin:0;color:#b8bec9;font-size:12px;line-height:1.7}.admin-balance-card code{color:#e4ecf7}.admin-balance-card .el-button{border:0;background:#dce9f8;color:#213b5c}.admin-balance-card .el-button:hover{background:#fff}.balance-summary{display:grid;grid-template-columns:minmax(220px,.8fr) 1.2fr;gap:18px;width:100%;margin-top:18px;padding:18px;border:1px solid #313844;border-radius:10px;background:#171a20}.balance-primary{display:flex;flex-direction:column;justify-content:center;min-height:90px}.balance-primary span{color:#a9c2df;font-size:12px}.balance-primary strong{margin:5px 0;font:700 32px/1.1 Consolas,monospace;color:#fff}.balance-primary small{color:#8993a2;font-size:11px}.balance-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.balance-metrics div{display:flex;flex-direction:column;justify-content:center;padding:10px 12px;border:1px solid #2b313b;border-radius:8px}.balance-metrics span{color:#8993a2;font-size:10px}.balance-metrics b{margin-top:4px;color:#e1e8f1;font:600 13px Consolas,monospace}.balance-raw{grid-column:1/-1;border-top:1px solid #2b313b;padding-top:10px;color:#a9c2df;font-size:11px}.balance-raw summary{cursor:pointer}.balance-result{max-height:300px;margin:12px 0 0;padding:15px;overflow:auto;border:1px solid #313844;border-radius:9px;background:#111318;color:#dce9f8;font:12px/1.6 Consolas,monospace;white-space:pre-wrap}.balance-error{width:100%;color:#f0a4a4!important}
.catalog-section{margin-top:44px}.catalog-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}.catalog-head h2{margin:7px 0 5px;font-size:28px;letter-spacing:-.04em}.catalog-head h2 small{font:500 13px Consolas,monospace;color:var(--muted)}.catalog-head p{margin:0;color:var(--muted);font-size:13px}.catalog-stats{display:flex;gap:14px;color:var(--muted);font-size:11px;white-space:nowrap}.catalog-stats b{color:var(--text);font-size:16px;margin-right:3px}
.catalog-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:18px 0}.catalog-search{width:270px}.catalog-search :deep(.el-input__wrapper){border-radius:8px;box-shadow:0 0 0 1px var(--border) inset}.catalog-search svg{width:15px;color:#7892b2}.category-tabs,.cost-tabs{display:flex;align-items:center;gap:5px;overflow:auto}.category-tabs button,.cost-tabs button{flex:none;padding:8px 10px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--muted);font-size:11px;cursor:pointer}.category-tabs button:hover,.cost-tabs button:hover{color:var(--text);background:#fff}.category-tabs button.active,.cost-tabs button.active{border-color:#c4d2e4;background:#fff;color:#315e94;box-shadow:var(--shadow-soft)}
.catalog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.catalog-card{min-width:0;padding:17px 18px 15px;border:1px solid var(--border);border-radius:12px;background:#fff;box-shadow:var(--shadow-soft);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}.catalog-card:hover{border-color:#c4d2e4;box-shadow:var(--shadow-floating);transform:translateY(-2px)}.catalog-card-top,.catalog-meta{display:flex;align-items:center;gap:8px}.catalog-card-top{justify-content:space-between}.method{padding:4px 7px;border-radius:5px;font:700 10px Consolas,monospace;letter-spacing:.06em}.method.get{background:#edf7ef;color:#3f7d53}.method.post{background:#eef3fb;color:#4a78b8}.method.delete{background:#fff0f0;color:#b55858}.method.put,.method.patch{background:#fff7e8;color:#a87926}.catalog-category{color:var(--text-tertiary);font-size:10px}.cost-tag{display:inline-flex;align-items:center;gap:4px;font-size:10px;white-space:nowrap}.cost-tag svg{width:12px}.cost-tag.free{color:#4f8a61}.cost-tag.quota{color:#a87926}.cost-tag.charged{color:#b55858}.cost-tag.unknown{color:#718096}.catalog-card h3{margin:14px 0 7px;font-size:15px}.catalog-path{display:block;overflow-wrap:anywhere;color:#4a78b8;font:12px/1.5 Consolas,monospace}.catalog-description{min-height:37px;margin:11px 0;color:var(--muted);font-size:12px;line-height:1.65}.catalog-fee{display:grid;grid-template-columns:34px 1fr;gap:8px;padding-top:10px;border-top:1px solid var(--border);font-size:11px;line-height:1.55}.catalog-fee span{color:var(--text-tertiary)}.catalog-fee strong{font-weight:500;color:#3e4652}.catalog-source{margin-top:10px;color:#a0a8b3;font:10px/1.4 Consolas,monospace;overflow-wrap:anywhere}.api-test-box{margin-top:14px;padding-top:12px;border-top:1px solid var(--border)}.test-request{margin-bottom:9px;color:#58779d;font-size:11px}.test-request summary{cursor:pointer;user-select:none}.test-request label{display:block;margin-top:9px;color:var(--muted);font-size:10px}.test-request input,.test-request textarea{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:8px 9px;border:1px solid var(--border);border-radius:7px;background:#f8fafc;color:var(--text);font:11px/1.5 Consolas,monospace;resize:vertical}.test-request textarea{min-height:78px}.api-test-button{width:100%;height:32px;border:1px solid #b6c9df;border-radius:7px;background:#edf3fb;color:#315e94;font-size:11px;cursor:pointer;transition:background .2s ease,border-color .2s ease}.api-test-button:hover:not(:disabled){border-color:#7e9dc2;background:#dfeaf7}.api-test-button:disabled{cursor:wait;opacity:.65}.api-test-response{margin-top:10px;padding:10px 11px;border-radius:7px;background:#f1f8f2;color:#477458;font-size:11px;line-height:1.55}.api-test-response.failed{background:#fff3f3;color:#a05252}.api-raw-response{margin-top:8px;border-top:1px solid currentColor;padding-top:7px;opacity:.9}.api-raw-response summary{cursor:pointer}.api-raw-response pre{max-height:190px;margin:8px 0 0;padding:9px;overflow:auto;border-radius:6px;background:#18201b;color:#d9f0dd;font:10px/1.5 Consolas,monospace;white-space:pre-wrap}.api-test-response.failed .api-raw-response pre{background:#26191b;color:#ffdede}.paid-test-lock{margin-top:14px;padding-top:12px;border-top:1px solid var(--border);color:#ad7777;font-size:11px}.catalog-empty{padding:45px 20px;border:1px dashed var(--border);border-radius:12px;background:#fff;color:var(--muted);text-align:center;font-size:13px}
.admin-boundary{display:block;margin-top:42px;border-left:3px solid #d2a35b;background:#fffaf1}.admin-boundary strong{font-size:13px}.admin-boundary p{max-width:820px}
@media(max-width:900px){.catalog-head{display:block}.catalog-stats{margin-top:14px}.catalog-search{width:100%}}
@media(max-width:720px){.admin-page-inner{width:calc(100% - 28px);padding:20px 0 80px}.admin-hero{padding:26px 0 25px}.admin-hero h1{font-size:40px}.admin-hero-mark{width:86px;height:86px;border-radius:22px}.admin-hero-mark svg{width:34px;height:34px}.admin-notice,.admin-balance-card{padding:16px}.admin-balance-card{display:block}.admin-balance-card .el-button{margin-top:15px}.balance-summary{grid-template-columns:1fr}.balance-primary{min-height:0}.catalog-grid{grid-template-columns:1fr}.catalog-toolbar{align-items:stretch}.category-tabs,.cost-tabs{width:100%}.catalog-head h2{font-size:24px}}
@media(prefers-reduced-motion:reduce){.catalog-card{transition:none}}
</style>
