
## [Ссылка на Postman Collection](https://www.postman.com/deadbyte0x/workspace/my-workspace/collection/15331768-5c9a8764-1f3c-4f49-b537-e77a35483661?action=share&creator=15331768)

### Конфигурация индекса

#### Анализатор

Для работы нечеткого поиска анализатор должен поддерживать минимальный набор фильтров:
1) lowercase - для преобразования "Word" и "word" к одному терму
2) stemmer - для отсечения окончаний ("foxes" -> "fox"), аналогично для приведения к общему терму (также существуют [альтернативы](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-snowball-tokenfilter.html#analysis-snowball-tokenfilter))

Опциональны, но также важны 
1) stop - для фильтрации стоп-слов (союзы, местоимения, предлоги)  
2) synonyms - для анализа синонимов (в данной работе опущен, так как требует дополнительной установки [плагина](https://github.com/nickyat/elasticsearch-analysis-morphology)) 

#### **`Создание индекса`** 

```json
{
    "mappings": {
        "dynamic": "strict",
        "properties": {
            "content": {
                "type": "text",
                "analyzer": "my_russian"
            }
        }
    },
    "settings": {
        "analysis": {
            "filter": {
                "ru_stop": {
                    "type": "stop",
                    "stopwords": "_russian_",
                    "ignore_case": "true"
                },
                "ru_stemmer": {
                    "type": "stemmer",
                    "language": "russian"
                }
            },
            "analyzer": {
                "my_russian": {
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "ru_stop",
                        "ru_stemmer"
                    ]
                }
            }
        }
    }
}
```

### Нечеткий поиск

#### **`Запрос`**

```json
{
  "query": {
    "match": {
      "content": {
        "query": "мама ела сосиски",
        "fuzziness": "auto"
      }
    }
  }
}
```

#### **`Ответ`**

```json
{
  "max_score": 1.2535897,
  "hits": [
    {
      "_index": "test-index",
      "_id": "1",
      "_score": 1.2535897,
      "_source": {
        "content": "моя мама мыла посуду а кот жевал сосиски"
      }
    },
    {
      "_index": "test-index",
      "_id": "3",
      "_score": 0.89614034,
      "_source": {
        "content": "мама мыла раму"
      }
    },
    {
      "_index": "test-index",
      "_id": "2",
      "_score": 0.3235163,
      "_source": {
        "content": "рама была отмыта и вылизана котом"
      }
    }
  ]
}
```

Первый документ содержит точное попадание двух из трех слов + "ела" и "мыла" очень похожи, что ему дает максимальный *вес*

Второй аналогично содержит похожие слова, но только одно точное попадание, *вес* чуть меньше

Третий документ, содержит такие слова как "рама" и "была", что отдаленно напоминают "мама" и "ела", поэтому минимальный *вес*


