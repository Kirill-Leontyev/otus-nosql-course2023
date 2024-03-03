package com.example.otus.service.mongodb;

import com.example.otus.service.BatchLoader;
import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.InsertOneModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.json.JsonObject;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MongoDBBulkLoader implements BatchLoader {

    private final MongoClient mongoClient;

    /**
     * JSON Bulk Write.
     */
    @Override
    public void insertJsonBatch(List<String> content) {
        MongoDatabase database = mongoClient.getDatabase("otus");
        MongoCollection<JsonObject> collection = database.getCollection("test", JsonObject.class);
        log.info("Открыто MongoDB соеднение");

        try {
            collection.bulkWrite(
                    content.stream()
                            .map(json -> new InsertOneModel<>(new JsonObject(json)))
                            .collect(Collectors.toList())
            );
        }
        catch (MongoException mongoException) {
            throw new RuntimeException("Ошибка отправки пакета в MongoDB");
        }
        log.info("MongoDB успешно принял batch");
    }
}
