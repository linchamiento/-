import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({plugins:[vue()],server:{port:5180,proxy:{'/api':{target:'http://localhost:8090',changeOrigin:true},'/uploads':{target:'http://localhost:8090'}}},build:{rollupOptions:{output:{manualChunks:{vue:['vue','vue-router','pinia'],element:['element-plus','@element-plus/icons-vue']}}}}})
