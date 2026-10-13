import axios from 'axios'
import { ElMessage } from 'element-plus'
const http=axios.create({baseURL:'/api/v1',withCredentials:true,timeout:15000,xsrfCookieName:'XSRF-TOKEN',xsrfHeaderName:'X-XSRF-TOKEN'})
http.interceptors.response.use(r=>r.data.data,e=>{const message=e.response?.data?.message||'连接服务失败，请稍后重试';if(e.response?.status!==401)ElMessage.error(message);return Promise.reject(e)})
export default http

