package com.example.otus.controller;

import com.example.otus.service.JsonReader;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final JsonReader readerForMongoDB;

    private final JsonReader readerForRedis;

    @GetMapping("/redis")
    private void insertIntoRedis() {
        readerForRedis.readAndSendJsonBatches();
    }

    @GetMapping("/mongo")
    private void insertIntoMongo() {
        readerForMongoDB.readAndSendJsonBatches();
    }

}
