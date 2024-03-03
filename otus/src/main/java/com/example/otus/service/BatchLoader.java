package com.example.otus.service;

import java.util.List;


public interface BatchLoader {

    void insertJsonBatch(List<String> content);
}
