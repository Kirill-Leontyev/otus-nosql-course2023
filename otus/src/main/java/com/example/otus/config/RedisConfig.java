package com.example.otus.config;

import com.redis.lettucemod.RedisModulesClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedisConfig {

    @Bean
    public RedisModulesClient redisModulesClient() {
        return RedisModulesClient.create("redis://90.156.215.203:6379/");
    }
}
