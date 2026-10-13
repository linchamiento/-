package com.shengxu.service;
import com.shengxu.entity.User; import com.shengxu.mapper.UserMapper; import com.shengxu.utils.BusinessException; import org.springframework.beans.factory.annotation.Value; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*; import java.util.*;
@Service
public class UserService {
 private final UserMapper users; private final Path root;
 public UserService(UserMapper users,@Value("${app.uploads}") String root){this.users=users;this.root=Paths.get(root).toAbsolutePath().normalize();}
 public User update(Long id,String username){if(username==null||username.trim().length()<2||username.trim().length()>40)throw new BusinessException(HttpStatus.BAD_REQUEST,"用户名长度应为 2–40 个字符");User u=users.selectById(id);u.setUsername(username.trim());try{users.updateById(u);}catch(Exception e){throw new BusinessException(HttpStatus.CONFLICT,"用户名已存在");}return u;}
 public String avatar(Long id,MultipartFile f){String type=f.getContentType();if(f.isEmpty()||type==null||!(type.equals("image/jpeg")||type.equals("image/png")||type.equals("image/webp")))throw new BusinessException(HttpStatus.BAD_REQUEST,"请选择 JPG、PNG 或 WebP 图片");String ext=type.equals("image/png")?".png":type.equals("image/webp")?".webp":".jpg";try{Files.createDirectories(root);String name=id+"-"+UUID.randomUUID()+ext;Files.copy(f.getInputStream(),root.resolve(name));User u=users.selectById(id);u.setAvatarUrl("/uploads/"+name);users.updateById(u);return u.getAvatarUrl();}catch(Exception e){throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR,"头像保存失败");}}
}
