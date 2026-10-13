import axios from 'axios'

const sunoHttp = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 30000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
})

export type SunoOperation = {
  method: string
  path: string
  category: string
  multipart: boolean
  paid: boolean
}

export type PromptSuggestionsResponse = {
  code?: number
  message?: string
  data?: {
    prompts?: string[]
    lyrics_prompts?: string[]
    tags?: string[]
    is_pending_personalization?: boolean
  }
  prompts?: string[]
  lyrics_prompts?: string[]
  tags?: string[]
}

export type InspirationResponse = {
  success?: boolean
  message?: string
  data?: {
    prompt?: string
    sourcePrompt?: string
    tags?: string[]
  }
}

export type StyleBoostResponse = {
  code?: number
  message?: string
  data?: {
    upsampledStyle?: string
    stylePrompt?: string
    prompt?: string
  }
  upsampledStyle?: string
  stylePrompt?: string
  prompt?: string
}

export const sunoApi = {
  operations: () => sunoHttp.get<{ success: boolean; data: SunoOperation[] }>('/suno/operations').then(r => r.data.data),
  execute: (request: { method: string; path: string; query?: Record<string, string>; body?: unknown }, options: { timeout?: number; signal?: AbortSignal } = {}) =>
    sunoHttp.post('/suno/execute', request, { responseType: 'json', ...options }).then(r => r.data),
  executeMultipart: async (request: { method: string; path: string; file?: File; params?: Record<string, string> }, options: { timeout?: number } = {}) => {
    const form = new FormData()
    form.append('method', request.method)
    form.append('path', request.path)
    Object.entries(request.params ?? {}).forEach(([key, value]) => form.append(key, value))
    if (request.file) form.append('file', request.file)
    const response = await sunoHttp.post('/suno/execute-multipart', form, { responseType: 'arraybuffer', ...options })
    const contentType = String(response.headers?.['content-type'] || '')
    if (contentType.includes('json') && response.data instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(new Uint8Array(response.data))
      try { return JSON.parse(text) } catch { return text }
    }
    return response.data
  },
  context: () => sunoHttp.post('/suno/execute', { method: 'GET', path: '/api/create-ui/context' }).then(r => r.data),
  generateIdea: (seedHint = '', instrumental = false) =>
    sunoHttp.post('/suno/execute', { method: 'POST', path: '/api/studio/song-idea', body: { seedHint, instrumental } }).then(r => r.data),
  promptSuggestions: (model = 'suno-v6', signal?: AbortSignal) =>
    sunoHttp.post<PromptSuggestionsResponse>('/suno/execute', { method: 'POST', path: '/api/prompts/suggestions', body: { model } }, { signal }).then(r => r.data),
  generateInspiration: (model = 'suno-v6', instrumental = false, signal?: AbortSignal) =>
    // Inspiration is an assist action. Keep the UI responsive when the upstream
    // provider stalls; the caller already has a local fallback.
    sunoHttp.post<InspirationResponse>('/inspiration/generate', { model, instrumental }, { signal, timeout: 15000 }).then(r => r.data),
  translateInspiration: (prompt: string, instrumental = false, signal?: AbortSignal) =>
    sunoHttp.post<StyleBoostResponse>('/suno/execute', {
      method: 'POST',
      path: '/api/music/boost-style',
      body: {
        model: 'suno-v6',
        originalTags: prompt,
        instrumental,
        user_guidance: '请将这段歌曲描述完整翻译并润色为简体中文，保留BPM、调性、乐器、段落和情绪信息。只输出中文歌曲描述，不要输出英文、标题或解释。'
      }
    }, { signal }).then(r => r.data),
  boostStyle: (prompt: string, lyrics = '', instrumental = false, userGuidance = '') =>
    sunoHttp.post('/suno/execute', { method: 'POST', path: '/api/music/boost-style', body: { model: 'suno-v6', originalTags: prompt, style: prompt, lyrics, instrumental, user_guidance: userGuidance || undefined } }).then(r => r.data),
  generateLyrics: (model: string, instruction: string, style = '', title = '', signal?: AbortSignal) =>
    sunoHttp.post('/suno/execute', { method: 'POST', path: '/api/lyrics/generate', body: { model, instruction, style, title, metadata: { lyrics_model: 'default', enable_thinking: false } } }, { signal }).then(r => r.data),
  adjustLyrics: (lyrics: string, mode = 'ignore_tone') =>
    sunoHttp.post('/suno/execute', { method: 'POST', path: '/api/create-ui/lyrics/adjust', body: { lyrics, mode, languages: ['zh', 'en'] } }).then(r => r.data)
}
