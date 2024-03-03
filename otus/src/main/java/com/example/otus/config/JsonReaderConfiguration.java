package com.example.otus.config;

import com.example.otus.service.JsonReader;
import com.example.otus.service.mongodb.MongoDBBulkLoader;
import com.example.otus.service.redis.RedisPipelineLoader;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Создание двух сервисов для разных БД.
 */
@Configuration
public class JsonReaderConfiguration {

    @Qualifier("MongoJsonReader")
    @Bean
    public JsonReader readerForMongoDB(MongoDBBulkLoader loader) {
        return new JsonReader(loader);
    }

    @Qualifier("RedisJsonReader")
    @Bean
    public JsonReader readerForRedis(RedisPipelineLoader loader) {
        return new JsonReader(loader);
    }
}
