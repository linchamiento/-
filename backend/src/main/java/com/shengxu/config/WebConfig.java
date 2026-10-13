package com.shengxu.config;
import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.Configuration; import org.springframework.web.servlet.config.annotation.*;
@Configuration public class WebConfig implements WebMvcConfigurer { @Value("${app.uploads}") String uploads; public void addResourceHandlers(ResourceHandlerRegistry r){r.addResourceHandler("/uploads/**").addResourceLocations("file:"+java.nio.file.Paths.get(uploads).toAbsolutePath().normalize()+"/");} }
