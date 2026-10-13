package com.shengxu.utils;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.time.Instant; import java.util.*;
@Component
public class JwtUtils {
 private final SecretKey key; private final long ttl;
 public JwtUtils(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.ttl-seconds}") long ttl){this.key=Keys.hmacShaKeyFor(Arrays.copyOf(secret.getBytes(StandardCharsets.UTF_8),32));this.ttl=ttl;}
 public Token create(Long userId){String jti=UUID.randomUUID().toString(); Instant now=Instant.now(); String value=Jwts.builder().subject(userId.toString()).id(jti).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(ttl))).signWith(key).compact(); return new Token(value,jti,ttl);}
 public Claims parse(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();}
 public record Token(String value,String jti,long ttl){}
}

