package com.example.otus.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static java.lang.String.format;

/**
 * Сервис для чтения JSON и последовательного создания/отправки батчей.
 */
@RequiredArgsConstructor
@Slf4j
public class JsonReader {

    private static final int BATCH_SIZE = 100_000;

    // private static final int BATCH_SIZE = 10;

    private final BatchLoader batchLoader;

    /**
     * Последовательное чтение файла и отправка запросов в Redis/MongoDB.
     */
    public void readAndSendJsonBatches() {
        ObjectMapper mapper = new ObjectMapper();
        AtomicInteger batchCounter = new AtomicInteger();

        try (JsonParser parser = mapper.getFactory().createParser(getJsonFile())) {
            List<String> content = Lists.newArrayListWithExpectedSize(BATCH_SIZE + 1);
            if (parser.nextToken() != JsonToken.START_ARRAY) {
                throw new IllegalStateException(
                        format("Json не валидный, ожидалось начало массива: %s", parser.currentToken().asString())
                );
            }
            while (parser.nextToken() != JsonToken.END_ARRAY) {
                TreeNode arrayContent = mapper.readTree(parser);
                String arrayContentAsString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(arrayContent);
                content.add(arrayContentAsString);
                batchCounter.incrementAndGet();

                if (batchCounter.get() == BATCH_SIZE) {
                    log.warn("Готовность отправить следующий батч");
                    batchLoader.insertJsonBatch(content);
                    batchCounter.getAndSet(0);
                    content.clear();
                }
                log.info("Батч успешно прочитан");
            }
        } catch (IOException e) {
            throw new RuntimeException("Ошибка создания парсера");
        }
        log.warn("Чтение завершено");
    }

    private File getJsonFile() {
        Resource resource = new ClassPathResource("static/users_1.7m.json");
        try {
            return resource.getFile();
        } catch (IOException e) {
            throw new RuntimeException("Не удалось получить файл");
        }
    }
}
