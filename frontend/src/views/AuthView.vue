<script setup lang="ts">import{onMounted,reactive,ref}from'vue';import{useRoute,useRouter}from'vue-router';import{useAuthStore}from'../store/auth';import{api}from'../api';type Account={username:string;email:string};type SavedAccount=Account&{password:string};const savedKey='shengxu.saved-login-accounts',loginMode=ref(true),loading=ref(false),rememberPassword=ref(false),form=reactive({username:'',email:'',password:''}),recentAccounts=ref<Account[]>([]),savedAccounts=ref<Record<string,SavedAccount>>({}),auth=useAuthStore(),router=useRouter(),route=useRoute();function readSaved(){try{return JSON.parse(localStorage.getItem(savedKey)||'{}') as Record<string,SavedAccount>}catch{return {}}}function persistSaved(){try{localStorage.setItem(savedKey,JSON.stringify(savedAccounts.value))}catch{}}function removeSaved(email:string){const next={...savedAccounts.value};delete next[email];savedAccounts.value=next;persistSaved();if(form.email===email)form.password=''}onMounted(async()=>{savedAccounts.value=readSaved();try{recentAccounts.value=await api.recentAccounts()}catch{recentAccounts.value=[]}});function chooseAccount(account:Account){form.email=account.email;form.password=savedAccounts.value[account.email]?.password||'';rememberPassword.value=!!form.password}async function submit(){loading.value=true;try{loginMode.value?await auth.login(form):await auth.register(form);if(rememberPassword.value){savedAccounts.value={...savedAccounts.value,[form.email]:{username:form.username||recentAccounts.value.find(a=>a.email===form.email)?.username||form.email,email:form.email,password:form.password}};persistSaved()}else removeSaved(form.email);router.push(String(route.query.redirect||'/create'))}finally{loading.value=false}}</script>
<template>
  <main class="auth-page auth-balanced">
    <header class="auth-topbar">
      <div class="auth-brand"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><b>声序</b></div>
      <span class="auth-topbar-note">每个声音，都值得被听见</span>
    </header>
    <div class="auth-content">
      <section class="auth-art" aria-label="声序创作空间">
        <div class="auth-copy">
          <span>YOUR NEXT SONG STARTS HERE</span>
          <h1>让灵感，<br/>有自己的声音。</h1>
          <p>一种情绪，一段故事。<br/>把脑海里的声音，变成下一首歌。</p>
          <div class="auth-story-note">AI MUSIC WORKSPACE</div>
        </div>
      </section>
      <section class="auth-form" aria-labelledby="auth-heading">
        <div class="form-wrap">
          <div class="auth-panel">
            <div class="auth-heading">
              <h2 id="auth-heading">{{loginMode?'继续你的创作':'创建创作者账户'}}</h2>
              <p>{{loginMode?'登录声序，让灵感接着发生。':'从这里开始，让灵感拥有自己的声音。'}}</p>
            </div>
            <el-form label-position="top" @submit.prevent="submit">
              <el-form-item v-if="!loginMode" label="用户名"><el-input v-model="form.username" minlength="2" maxlength="40" placeholder="你的创作者名称" autocomplete="nickname"/></el-form-item>
              <el-form-item label="邮箱"><el-input v-model="form.email" type="email" placeholder="name@example.com" autocomplete="username"/></el-form-item>
              <el-form-item label="密码"><el-input v-model="form.password" type="password" show-password placeholder="至少 8 位字符" :autocomplete="loginMode?'current-password':'new-password'"/></el-form-item>
              <label v-if="loginMode" class="remember-password"><input v-model="rememberPassword" type="checkbox"/> <span>在此浏览器记住密码</span></label>
              <el-button class="auth-submit" native-type="submit" type="primary" size="large" :loading="loading" :disabled="!form.email||form.password.length<8||(!loginMode&&!form.username)">{{loginMode?'登录':'创建账户'}}</el-button>
            </el-form>
            <p class="auth-register">{{loginMode?'还没有账户？':'已经有账户？'}} <button type="button" class="auth-mode-switch" @click="loginMode=!loginMode">{{loginMode?'立即注册':'返回登录'}}</button></p>
            <div v-if="loginMode&&recentAccounts.length" class="recent-accounts" aria-label="历史账号">
              <span>使用历史账号</span>
              <div>
                <div v-for="account in recentAccounts" :key="account.email" class="recent-account-row">
                  <button type="button" class="recent-account" :aria-label="'选择 '+account.username+'，'+account.email" :aria-pressed="form.email===account.email" :title="account.username+' · '+account.email" @click="chooseAccount(account)">
                    <span class="recent-account-avatar" aria-hidden="true">{{account.username.slice(0,2)}}</span><strong>{{account.username}}</strong>
                  </button>
                  <button v-if="savedAccounts[account.email]" type="button" class="remove-saved-account" :aria-label="'删除 '+account.username+' 已记住的密码'" title="删除已记住的密码" @click="removeSaved(account.email)">×</button>
                </div>
              </div>
            </div>
          </div>
          <p class="fineprint">继续即表示你同意合理使用 AI 音乐服务。</p>
        </div>
      </section>
    </div>
  </main>
</template>
