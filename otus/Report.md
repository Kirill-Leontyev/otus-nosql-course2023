## Pipeline/BulkInsert: Сравнение скорости обработки запросов Redis/MongoDB  через анализ нагрузки на сервер 

### Взаимодействие с БД

Было написано небольшое Spring приложение - большой JSON файл последовательно читался и каждые 10К записей вызывался метод для вставки нового JSON batch'a

**`Реализация загрузки для MongoDB`**

```java 
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
```

**`Реализация загрузки для Redis`**

```java
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
```

### Инфраструктура 

Было поднято несколько ВМ, для MongoDB/Redis/Prometheus/Grafana соответственно

Для получения актуального состояния машин вместе с MongoDB/Redis был подняты [Node Exporter](https://prometheus.io/docs/guides/node-exporter/)

Для Prometheus были созданы job для отслеживания портов Node Exporter соответственно

```yaml
- job_name: "redis"
  scrape_interval: 5s
  static_configs:
    - targets: ["10.0.0.129:9100", "10.0.0.129:9121"]
- job_name: "mongo"
  scrape_interval: 5s
  static_configs:
    - targets: ["10.0.0.249:9100"]
```

### Сравнение нагрузки

Датасет на 1.7М записей был полностью загружен в течение ~3 минут как для Redis, так и для MongoDB

#### Нагрузка на сеть

Нагрузка на сеть от Redis рваная, в пике достигала 70Mb/s

![](screens\redis-network-traffic.png)

MongoDB не так расточителен с трафиком - на пике всего 42Mb/s, плюс нагрузка постепенно снижается, несмотря на то что размер батча никак не изменяется в течение работы приложения

![](screens\mongo-network-traffic.png)

#### Нагрузка на RAM

Исходя из данных, MongoDB полагается на кеширование, забирая большую часть RAM для WiredTiger

**`MongoDB`**

![](screens\mongo-ram.png)

Redis несмотря на то что по умолчанию хранит все данные в RAM, потребляет в данном тесте намного меньше RAM (почти на 1.5ГБ по сравнению с MongoDB)

**`Redis`**

![](screens\redis-ram.png)

#### Нагрузка на CPU

В среднем базы нагружали CPU одинаково, но MongoDB тратил чуть меньше

**`MongoDB`**

![](screens\mongo-cpu.png)

**`Redis`**

![](screens\redis-cpu.png)

#### Краткое заключение

1. RAM - Redis, однако теста недостаточно чтобы отразить реальное положение вещей, так как по-хорошему необходима <br> а) конфигурация c включением персистености (appendonly=yes и т.д) <br> б) загрузка данными в течение долгого времени (от суток)
2. Network - MongoDB
3. CPU - Ничья

Также стоит отметить что ни один запрос не попал ни в выборку SLOWLOG GET, ни в db.currentOp()

Сделан вывод что тестирование Standalone версий БД не позволит отразить настоящую работоспособность, поэтому для проф. тестирования необходимо обращаться к кластерными версиям обоих баз данных. 

В процессе работы было также обнаружено, что вопреки заверениям что обе БД работают "из коробки", есть некоторые трудности с их поднятием:

* Тот же Redis необходимо настраивать на уровне ОС (vm.overcommit_memory = 1), на Ubuntu нельзя работать как с Redis как со службой (systemctl), 
из-за чего приходится включать/перезагружать вручную, причем данная "ошибка" нигде особо не подсвечена.

* Добавление модулей (типа RedisJSON) через конфигурационный файл часто не работает, например ссылаясь на то что отсутствуют права на его чтение, решением является использование Redis Stack который предоставляет хотя бы какие-то первоначальные доп. модули.

* В конфигурации по умолчанию Redis смотрит только на localhost, что в начале очень сбивает с толку - требуется также идти в конфигурацию и прописывать пул (или все) адресов которые могут обращаться удаленно; отсутствует логгирование по умолчанию

* Prometheus требует Enterprise версию для работы с MongoDB



