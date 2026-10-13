package com.shengxu.config;
import com.baomidou.mybatisplus.annotation.DbType; import com.baomidou.mybatisplus.extension.plugins.*; import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor; import org.springframework.context.annotation.*;
@Configuration public class MybatisConfig { @Bean MybatisPlusInterceptor mybatisPlusInterceptor(){MybatisPlusInterceptor i=new MybatisPlusInterceptor();i.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));return i;} }

