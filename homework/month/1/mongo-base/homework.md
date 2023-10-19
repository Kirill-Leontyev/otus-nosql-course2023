## Подготовка данных

В качестве тестовых датасетов был взят репозиторий с копиями датасетов из облачного MongoDB Atlas.

https://github.com/neelabalan/mongodb-sample-dataset

## Подготовка к запуску MongoDB

В качестве способа запуска МongoDB был выбран docker-compose.
Был написан ниже указанный скрипт + переменные окружения.

#### **`docker-compose.yml`**

```yml
version: '3.7'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb_hw3
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
    env_file:
      - .env
    ports:
      - ${MONGODB_PORTS}
    volumes:
      - ./mongo_db/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
      - ./mongo_db/log:/var/log/mongodb
```

#### **`.env`**

```text
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=root
MONGO_INITDB_DATABASE=admin
MONGODB_USERNAME=kirill
MONGODB_PASSWORD=password
MONGODB_DATABASE=hw3-db
MONGODB_PORTS=27017:27017
```

Данный скрипт, помимо создания 'рутового' пользователя и настройки портов, также настроен на начальную настройку БД с
помощью монитирования файла **mongo-init.js**.

#### **`mongo-init.js`**

```javascript
db = db.getSiblingDB(process.env["MONGO_INITDB_DATABASE"])

db.auth(process.env["MONGO_INITDB_ROOT_USERNAME"], process.env["MONGO_INITDB_ROOT_PASSWORD"])

db = db.getSiblingDB(process.env["MONGODB_DATABASE"])

db.createUser({
    user: process.env["MONGODB_USERNAME"],
    pwd: process.env["MONGODB_PASSWORD"],
    roles: [
        {
            role: 'readWrite',
            db: process.env["MONGODB_DATABASE"],
        },
    ],
});
```

В данном скрипте происходят поочередно следующие действия:
<ul>
<li>Получение БД, изначально настроенной под рутового пользователя</li>
<li>Авторизация с помощью тех же переменных окружения</li>
<li>Переход на другую, тестовую, базу данных на которой будут храниться данные</li>
<li>Создание нового пользователя для данной базы - с полными правами на чтение/изменение данных в рамках данной базы </li>
</ul>

## Запуск через Docker

По итогу имея на руках следующих структуру каталога, нам достаточно перейти в директорию hw3 и вызывать следующую команду для первоначальной сборки контейнера 

<img src='tree_folder.png' width=60% height=60%>

```shell
docker-compose -f docker-compose.yml up -d --build
```

В итоге мы должны получить сообщение об успешной сборке и запуске контейнера

![img.png](up_build.png)

После этого мы можем зайти внутрь контейнера на тестовую базу с помощью следующих команд

```shell
docker exec -it mongodb_hw3 bash
mongosh hw3-db -u kirill -p password
```

![img.png](exec_sh.png)

Для того чтобы импортировать в БД один из тестовых датасетов в формате **.json**, для начала необходимо с хостовой машины скопировать директорию в контейнер

```shell
docker cp ./json_data mongodb_hw3:/json_data
```

Мы увидим директорию лежащую в корневой директории

![img.png](copy_json.png)

## Импорт данных

Для импортирования воспользуемя утилитой mongoimport, пропишем следующие команды: 

```shell
mongoimport --uri="mongodb://kirill:password@localhost:27017/hw3-db" --collection=movies --file=movies.json

mongoimport --uri="mongodb://kirill:password@localhost:27017/hw3-db" --collection=users --file=users.json

mongoimport --uri="mongodb://kirill:password@localhost:27017/hw3-db" --collection=comments --file=comments.json
```

При успешной отработке можно увидеть кол-во добавленных данных и кол-во пропущенных (например, если **_id** уже присутствует в данной коллекции)

![img.png](import_success.png)

## Работа с данными

Совершим пару простых действий:

Получим первые 10 докуметов и отсортируем по идентификатору

```javascript
db.movies.find().sort({_id: 1}).limit(10)
```
Получим количество фильмов, снятых между 2004 и 2006 годами

```javascript
db.getCollection('movies').find({year: {$gte: 2004, $lte: 2006}}).count()
```

Добавим два новых фильма с помощью **insertMany**

```javascript
db.movies.insertMany([{title:'My film 1', genre:['Horror']}, {title:'My film 2', genre:['Comedy']}])
```

![img_1.png](insert_many.png)

## Индексы

MongoDB имеет поддержку следующих индексов:
1. Индекс одного поля
2. Составной индекс
3. Multikey Index
4. Геопространственный индекс
5. Текстовый указатель
6. Хешированный индекс

Создадим Multikey Index для поля **cast**, текстовой индекс для поля **fullplot** на английском языке, и обычный индекс для **title** - все с **sortOrder = 1**

```javascript
db.movies.createIndex({cast: 1});
[with_index.json](with_index.json)
db.movies.createIndex({title: 1});

db.movies.createIndex(
    {fullplot: "text"}, 
    {default_language: "english"}
);
```
Посмотреть какие индексы присутствуют в коллекции:

```javascript
db.movies.getIndexes();
```
![img.png](getIndexes.png)

Найдем упоминание какого-нибудь слова в поле **fullplot** и c помощью метода **explain** посмотрим насколько отличается поиск c индексом и без

Исходный full-text search запрос с использованием индекса (*with_index.js*)
```javascript
db.movies.find({
    $text: {$search: "killer"}
}).explain("executionStats");
```
Запрос через Regex, который не нуждается в использовании индекса (*without_index.js*)
```javascript
db.movies.find(
    {fullplot:{ $regex: 'killer'} }
).explain("executionStats");
```

Сравним их *executionStats*

<table>
<tr>
<th>С индексом</th>
<th>Без индекса</th>
</tr>
<tr>
<td>

```json lines
executionStats {
  executionSuccess: true, 
  nReturned: 546,
  executionTimeMillis: 4,
  totalKeysExamined: 546,
  totalDocsExamined: 546,
}
```
</td>
<td>

```json lines
executionStats {
  executionSuccess: true,
  nReturned: 523,
  executionTimeMillis: 50,
  totalKeysExamined: 0,
  totalDocsExamined: 23541
}
```

</td>
</tr>
</table>

Индексу понадобилось пройти через большее кол-во документов, а время выполнения заняло в 12,5 больше времени