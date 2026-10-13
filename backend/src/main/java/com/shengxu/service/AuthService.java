package com.shengxu.service;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper; import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.shengxu.dto.AuthDtos.*; import com.shengxu.entity.*; import com.shengxu.mapper.*; import com.shengxu.utils.*;
import jakarta.servlet.http.*; import org.springframework.beans.factory.annotation.Value; import org.springframework.data.redis.core.StringRedisTemplate; import org.springframework.http.*; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
@Service
public class AuthService {
 private final UserMapper users; private final UserCreditMapper credits; private final CreditRecordMapper records; private final PasswordEncoder encoder; private final JwtUtils jwt; private final StringRedisTemplate redis; private final boolean secure;
 public AuthService(UserMapper u,UserCreditMapper c,CreditRecordMapper r,PasswordEncoder e,JwtUtils j,StringRedisTemplate redis,@Value("${app.jwt.cookie-secure}") boolean secure){users=u;credits=c;records=r;encoder=e;jwt=j;this.redis=redis;this.secure=secure;}
 @Transactional public UserView register(Register in,HttpServletResponse response){
  if(users.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail,in.email().trim().toLowerCase()))>0)throw new BusinessException(HttpStatus.CONFLICT,"该邮箱已注册");
  if(users.selectCount(new LambdaQueryWrapper<User>().eq(User::getUsername,in.username().trim()))>0)throw new BusinessException(HttpStatus.CONFLICT,"用户名已存在");
  User u=new User();u.setId(IdWorker.getId());u.setUsername(in.username().trim());u.setEmail(in.email().trim().toLowerCase());u.setPasswordHash(encoder.encode(in.password()));users.insert(u);
  UserCredit credit=new UserCredit();credit.setId(IdWorker.getId());credit.setUserId(u.getId());credit.setBalance(100);credit.setVersion(0);credits.insert(credit);
  CreditRecord record=new CreditRecord();record.setId(IdWorker.getId());record.setUserId(u.getId());record.setRecordType("GRANT");record.setAmount(100);record.setBalanceAfter(100);record.setBusinessNo("REGISTER:"+u.getId());record.setRemark("新用户注册赠送");records.insert(record);
  issue(u.getId(),response); return new UserView(u.getId(),u.getUsername(),u.getEmail(),null,100);
 }
 public UserView login(Login in,HttpServletResponse response){User u=users.selectOne(new LambdaQueryWrapper<User>().eq(User::getEmail,in.email().trim().toLowerCase()));if(u==null||!encoder.matches(in.password(),u.getPasswordHash()))throw new BusinessException(HttpStatus.UNAUTHORIZED,"邮箱或密码错误");issue(u.getId(),response);return view(u);}
 public void logout(HttpServletRequest req,HttpServletResponse res){if(req.getCookies()!=null)for(var c:req.getCookies())if("SHENGXU_TOKEN".equals(c.getName()))try{redis.delete("session:"+jwt.parse(c.getValue()).getId());}catch(Exception ignored){} ResponseCookie cookie=ResponseCookie.from("SHENGXU_TOKEN","").httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(0).build();res.addHeader(HttpHeaders.SET_COOKIE,cookie.toString());}
 public UserView me(Long id){User u=users.selectById(id);if(u==null)throw new BusinessException(HttpStatus.UNAUTHORIZED,"登录状态已失效");return view(u);}
 private UserView view(User u){UserCredit c=credits.selectOne(new LambdaQueryWrapper<UserCredit>().eq(UserCredit::getUserId,u.getId()));return new UserView(u.getId(),u.getUsername(),u.getEmail(),u.getAvatarUrl(),c==null?0:c.getBalance());}
 private void issue(Long id,HttpServletResponse res){JwtUtils.Token t=jwt.create(id);redis.opsForValue().set("session:"+t.jti(),id.toString(),Duration.ofSeconds(t.ttl()));ResponseCookie cookie=ResponseCookie.from("SHENGXU_TOKEN",t.value()).httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(t.ttl()).build();res.addHeader(HttpHeaders.SET_COOKIE,cookie.toString());}
}

