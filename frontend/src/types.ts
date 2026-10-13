export type EntityId = string | number
export interface User { id:EntityId; username:string; email:string; avatarUrl?:string; creditBalance:number }
export interface Track { id:EntityId; taskId:EntityId; providerSongId?:string; title:string; status:string; audioUrl?:string; coverUrl?:string; lyrics?:string; styleTags?:string; duration?:number; modelVersion?:string; sourceType?:string; favorite?:boolean; createdAt:string }
export interface MusicTask { id:EntityId; prompt:string; style:string; mood:string; vocalType:string; language?:string; lyricsMode:string; songTitle?:string; negativeTags?:string; modelVersion?:string; maxMode?:boolean; weirdness?:number; styleWeight?:number; duration?:number; variety?:number; sourceClipId?:string; sourceType?:string; sourceAudioUrl?:string; sourceTitle?:string; audioWeight?:number; voiceId?:string; soundType?:string; soundBpm?:number; soundKey?:string; soundLoop?:boolean; status:string; submitStage:string; errorMessage?:string; createdAt:string; tracks:Track[] }
export interface TrackComment { id:EntityId; trackId:EntityId; userId:EntityId; username:string; content:string; createdAt:string; canDelete:boolean }
export interface TrackShare { token:string; expiresAt:string }
export interface SharedTrack { id:EntityId; title:string; username:string; audioUrl:string; coverUrl?:string; styleTags?:string; duration?:number; modelVersion?:string; createdAt:string }
export interface PageData<T>{items:T[];total:number;page:number;pageSize:number}
