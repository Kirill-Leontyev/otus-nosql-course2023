package com.example.otus.service.redis;

import com.example.otus.service.BatchLoader;
import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.RandomBasedGenerator;
import com.redis.lettucemod.RedisModulesClient;
import com.redis.lettucemod.api.StatefulRedisModulesConnection;
import com.redis.lettucemod.api.async.RedisModulesAsyncCommands;
import io.lettuce.core.LettuceFutures;
import io.lettuce.core.RedisFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Сервис для Pipeline вставки JSON.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisPipelineLoader implements BatchLoader {

    private static final RandomBasedGenerator gen = Generators.randomBasedGenerator();

    private final RedisModulesClient redisModulesClient;

    /**
     * JSON.SET, ключом выступает UUID.
     */
    @Override
    public void insertJsonBatch(List<String> content) {
        StatefulRedisModulesConnection<String, String> connection = redisModulesClient.connect();
        log.info("Открыто Redis соеднение");
        RedisModulesAsyncCommands<String, String> commands = connection.async();
        connection.setAutoFlushCommands(Boolean.FALSE);
        List<RedisFuture<?>> futures = new ArrayList<>();
        content.forEach(json -> {
            var future = commands.jsonSet(gen.generate().toString(), ".", json);
            futures.add(future);
        });
        connection.flushCommands();
        LettuceFutures.awaitAll(Duration.ofSeconds(5), futures.toArray(new RedisFuture[0]));
        connection.close();
        log.info("Redis соединение закрыто");
    }
}
