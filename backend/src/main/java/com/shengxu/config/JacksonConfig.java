package com.shengxu.config;

import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Preserve Snowflake identifiers when JSON is consumed by JavaScript. */
@Configuration
public class JacksonConfig {
 @Bean Jackson2ObjectMapperBuilderCustomizer longIdentifiers() {
  return builder -> builder.serializerByType(Long.class, ToStringSerializer.instance);
 }
}
