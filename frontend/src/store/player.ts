import { defineStore } from 'pinia'
import type { Track } from '../types'
export type RepeatMode = 'off' | 'all' | 'one'
export const usePlayerStore = defineStore('player', {
  state: () => ({ track: null as Track | null, queue: [] as Track[], currentIndex: -1, playing: false,
    current: 0, duration: 0, volume: .75, muted: false, lastVolume: .75, shuffle: false,
    repeat: 'off' as RepeatMode, error: '', seekRevision: 0, favoriteOverrides: {} as Record<string, boolean> }),
  actions: {
    setQueue(items: Track[], index = 0) {
      const selected = items[index]
      this.queue = items.filter(t => !!t.audioUrl)
      this.currentIndex = selected ? this.queue.findIndex(t => t.id === selected.id) : -1
      if (this.currentIndex < 0 && this.queue.length) this.currentIndex = 0
    },
    play(t: Track, items?: Track[]) {
      if (!t.audioUrl) return
      if (items) this.setQueue(items, items.findIndex(item => item.id === t.id))
      else {
        let index = this.queue.findIndex(item => item.id === t.id)
        if (index < 0) { this.queue.push(t); index = this.queue.length - 1 }
        this.currentIndex = index
      }
      this.track = this.queue[this.currentIndex] || t
      this.playing = true; this.current = 0; this.duration = t.duration || 0; this.error = ''; this.seekRevision++
    },
    toggle() { if (this.track) { this.error = ''; this.playing = !this.playing } },
    setError(message: string) { this.error = message; this.playing = false },
    seek(seconds: number) { this.current = Math.max(0, Math.min(seconds, this.duration || 0)); this.seekRevision++ },
    next(automatic = false) {
      if (!this.queue.length) return null
      let index = this.currentIndex + 1
      if (automatic && this.repeat === 'one') index = this.currentIndex
      else if (this.shuffle && this.queue.length > 1) {
        const options = this.queue.map((_, i) => i).filter(i => i !== this.currentIndex)
        index = options[Math.floor(Math.random() * options.length)]!
      } else if (index >= this.queue.length) {
        if (this.repeat === 'all' || !automatic) index = 0
        else { this.playing = false; return null }
      }
      this.play(this.queue[index]!); return this.track
    },
    previous() {
      if (!this.track) return null
      if (this.current > 3) { this.seek(0); return this.track }
      const index = this.currentIndex > 0 ? this.currentIndex - 1 : this.repeat === 'all' ? this.queue.length - 1 : 0
      if (this.queue[index]) this.play(this.queue[index]!)
      return this.track
    },
    toggleShuffle() { this.shuffle = !this.shuffle },
    toggleRepeat() { this.repeat = this.repeat === 'off' ? 'all' : this.repeat === 'all' ? 'one' : 'off' },
    setVolume(value: number) { this.volume = Math.max(0, Math.min(1, value)); this.muted = this.volume === 0; if (this.volume > 0) this.lastVolume = this.volume },
    toggleMute() {
      if (this.muted || this.volume === 0) { this.volume = this.lastVolume || .75; this.muted = false }
      else { this.lastVolume = this.volume; this.muted = true }
    },
    removeFromQueue(id: Track['id']) {
      const index = this.queue.findIndex(t => t.id === id)
      if (index < 0) return
      const currentId = this.track?.id, wasPlaying = this.playing
      this.queue.splice(index, 1)
      if (!this.queue.length) { this.reset(); return }
      if (currentId === id) { this.play(this.queue[Math.min(index, this.queue.length - 1)]!); this.playing = wasPlaying }
      else this.currentIndex = this.queue.findIndex(t => t.id === currentId)
    },
    moveQueue(from: number, to: number) {
      if (from === to || from < 0 || to < 0 || from >= this.queue.length || to >= this.queue.length) return
      const [item] = this.queue.splice(from, 1); this.queue.splice(to, 0, item!)
      this.currentIndex = this.queue.findIndex(t => t.id === this.track?.id)
    },
    syncFavorite(id: Track['id'], favorite: boolean) {
      this.favoriteOverrides[String(id)] = favorite
      this.queue.forEach(t => { if (t.id === id) t.favorite = favorite })
      if (this.track?.id === id) this.track.favorite = favorite
    },
    isFavorite(t: Track) { return this.favoriteOverrides[String(t.id)] ?? !!t.favorite },
    clearQueue() { this.reset() },
    reset() { this.track = null; this.queue = []; this.currentIndex = -1; this.playing = false; this.current = 0; this.duration = 0; this.error = '' },
  },
})
