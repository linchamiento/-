import http from './http'; import type {MusicTask,PageData,Track,User,EntityId,TrackComment,TrackShare,SharedTrack} from '../types'
export { sunoApi } from './suno'
export const api={
 register:(v:{username:string;email:string;password:string})=>http.post<any,User>('/auth/register',v), login:(v:{email:string;password:string})=>http.post<any,User>('/auth/login',v), logout:()=>http.post('/auth/logout'), me:()=>http.get<any,User>('/users/me'),
 updateMe:(username:string)=>http.patch<any,User>('/users/me',{username}), uploadAvatar:(file:File)=>{const f=new FormData();f.append('file',file);return http.post<any,{avatarUrl:string}>('/users/me/avatar',f)},
 templates:()=>http.get<any,Array<Record<string,string>>>('/templates'), createTask:(v:unknown,key:string)=>http.post<any,MusicTask>('/music-tasks',v,{headers:{'Idempotency-Key':key}}), task:(id:EntityId)=>http.get<any,MusicTask>(`/music-tasks/${id}`), tasks:()=>http.get<any,PageData<MusicTask>>('/music-tasks'),
 library:(q='',page=1,filter='all')=>http.get<any,PageData<Track>>('/music-library',{params:{q,page,pageSize:12,filter}}), track:(id:EntityId)=>http.get<any,Track>(`/music-library/${id}`), favoriteTrack:(id:EntityId,favorite:boolean)=>http.patch<any,Track>(`/music-library/${id}/favorite`,{favorite}), deleteTrack:(id:EntityId)=>http.delete(`/music-library/${id}`), credits:()=>http.get<any,{balance:number}>('/credits/balance'), creditRecords:()=>http.get<any,PageData<any>>('/credits/records'),
 comments:(id:EntityId,page=1)=>http.get<any,PageData<TrackComment>>(`/music-library/${id}/comments`,{params:{page,pageSize:20}}),
 addComment:(id:EntityId,content:string)=>http.post<any,TrackComment>(`/music-library/${id}/comments`,{content}),
 deleteComment:(id:EntityId,commentId:EntityId)=>http.delete(`/music-library/${id}/comments/${commentId}`),
 createShare:(id:EntityId)=>http.post<any,TrackShare>(`/music-library/${id}/share`),
 sharedTrack:(token:string)=>http.get<any,SharedTrack>(`/music-library/share/${encodeURIComponent(token)}`),
}
