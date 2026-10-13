import {defineStore} from 'pinia';import {api} from '../api';import type {User} from '../types';import {usePlayerStore} from './player'
export const useAuthStore=defineStore('auth',{state:()=>({user:null as User|null,ready:false}),actions:{async restore(){try{this.user=await api.me()}catch{this.user=null}finally{this.ready=true}},async login(v:{email:string;password:string}){this.user=await api.login(v)},async register(v:{username:string;email:string;password:string}){this.user=await api.register(v)},async logout(){await api.logout();usePlayerStore().reset();this.user=null}}})

