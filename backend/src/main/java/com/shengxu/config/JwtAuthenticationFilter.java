package com.shengxu.config;
import com.shengxu.utils.JwtUtils; import io.jsonwebtoken.Claims; import jakarta.servlet.*; import jakarta.servlet.http.*;
import org.springframework.data.redis.core.StringRedisTemplate; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtUtils jwt; private final StringRedisTemplate redis;
 public JwtAuthenticationFilter(JwtUtils jwt,StringRedisTemplate redis){this.jwt=jwt;this.redis=redis;}
 protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  if(req.getCookies()!=null) for(var c:req.getCookies()) if("SHENGXU_TOKEN".equals(c.getName())) try{Claims claims=jwt.parse(c.getValue()); if(Boolean.TRUE.equals(redis.hasKey("session:"+claims.getId()))) SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(Long.valueOf(claims.getSubject()),null,List.of()));}catch(Exception ignored){}
  chain.doFilter(req,res);
 }
}

