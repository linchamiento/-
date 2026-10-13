package com.shengxu.config;
import jakarta.servlet.*; import java.io.IOException;
import org.springframework.context.annotation.*; import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.config.http.SessionCreationPolicy; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.security.web.SecurityFilterChain; import org.springframework.security.web.csrf.*; import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler; import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; import org.springframework.web.filter.OncePerRequestFilter;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean SecurityFilterChain chain(HttpSecurity http,JwtAuthenticationFilter jwt)throws Exception{
  CookieCsrfTokenRepository repo=CookieCsrfTokenRepository.withHttpOnlyFalse(); repo.setCookiePath("/");
  CsrfTokenRequestAttributeHandler handler=new CsrfTokenRequestAttributeHandler(); handler.setCsrfRequestAttributeName(null);
  return http.sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).csrf(c->c.csrfTokenRepository(repo).csrfTokenRequestHandler(handler).ignoringRequestMatchers("/api/v1/auth/login","/api/v1/auth/register"))
   .authorizeHttpRequests(a->a.requestMatchers("/api/v1/auth/**","/api/v1/templates","/api/v1/music-library/share/**","/actuator/health","/v3/api-docs/**","/swagger-ui/**","/uploads/**").permitAll().anyRequest().authenticated())
   .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->res.sendError(401)))
   .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).addFilterAfter(new CsrfCookieFilter(),JwtAuthenticationFilter.class).build();
 }
 static class CsrfCookieFilter extends OncePerRequestFilter { protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest r,jakarta.servlet.http.HttpServletResponse s,FilterChain c)throws ServletException,IOException{CsrfToken t=(CsrfToken)r.getAttribute(CsrfToken.class.getName()); if(t!=null)t.getToken(); c.doFilter(r,s);} }
}
