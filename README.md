# Utils 工具包

这是一个包含多种常用工具的实用工具包，为项目提供统一的工具接口。

## 安装依赖

```bash
bun install
```

## 运行项目

```bash
bun run dev
```

## 工具列表

### 1. etcd.js - Etcd 客户端工具

Etcd 分布式键值存储客户端工具。

#### 方法说明

- `put(key, value, options)`: 存储键值对
- `get(key, options)`: 获取键值
- `delete(key, options)`: 删除键
- `lock(key, ttl)`: 获取分布式锁
- `deleteAll(prefix)`: 删除指定前缀的所有键
- `watch(key, callback)`: 监听键变化
- `close()`: 关闭客户端连接

#### 使用示例

```javascript
import utils from '#utils';

// 存储数据
await utils.etcd.put('config/app', JSON.stringify({ name: 'myapp', version: '1.0.0' }));

// 获取数据
const data = await utils.etcd.get('config/app');
console.log(JSON.parse(data));

// 使用分布式锁
const lock = await utils.etcd.lock('resource-lock', 30);
try {
  // 执行临界区操作
  console.log('Lock acquired');
} finally {
  await lock.release();
}
```

````javascript
import utils from '#utils';



### 3. mongo.js - MongoDB 客户端工具

MongoDB 数据库操作工具。

#### 方法说明

- `newClient()`: 创建新的 MongoDB 客户端
- `getInstance()`: 获取单例 MongoDB 客户端实例
- `close()`: 关闭客户端连接
- `insertOne(collection, document)`: 插入单个文档
- `deleteOne(collection, filter)`: 删除单个文档
- `updateOne(collection, filter, update)`: 更新单个文档
- `findOne(collection, filter)`: 查找单个文档
- `paginate(collection, filter, options)`: 分页查询文档
- `query(collection, filter, options)`: 查询文档
- `insertMany(collection, documents)`: 批量插入文档
- `bulkWrite(collection, operations)`: 批量写入操作
- `aggregate(collection, pipeline)`: 聚合查询
- `dropTable(collection)`: 删除集合
- `buildFilter(query)`: 构建查询过滤器

#### 使用示例

```javascript
import utils from '#utils';

// 插入文档
await utils.mongo.insertOne('users', {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
});

// 查询文档
const user = await utils.mongo.findOne('users', { email: 'john@example.com' });
console.log('Found user:', user);

// 分页查询
const result = await utils.mongo.paginate(
    'users',
    {},
    {
        page: 1,
        limit: 10,
        sort: { name: 1 },
    }
);
````

### 4. rabbit.js - RabbitMQ 消息队列工具

RabbitMQ 消息队列操作工具，支持生产者和消费者模式。

#### 方法说明

**基础方法:**

- `createConnection()`: 创建 RabbitMQ 连接
- `getChannel()`: 获取通道
- `assertQueue(queue, options)`: 声明队列
- `assertExchange(exchange, type, options)`: 声明交换机
- `bindQueue(queue, exchange, routingKey)`: 绑定队列到交换机
- `publishToQueue(queue, message, options)`: 发布消息到队列
- `publishToExchange(exchange, routingKey, message, options)`: 发布消息到交换机
- `consume(queue, callback, options)`: 消费消息
- `closeConnection()`: 关闭连接
- `getQueueInfo(queue)`: 获取队列信息

**生产者类 RabbitMQProducer:**

- `publish(queue, message, options)`: 发布单个消息
- `publishBatch(queue, messages, options)`: 批量发布消息
- `close()`: 关闭生产者连接

**消费者类 RabbitMQConsumer:**

- `consume(queue, callback, options)`: 开始消费消息
- `stopConsuming()`: 停止消费
- `getQueueInfo(queue)`: 获取队列信息
- `close()`: 关闭消费者连接

#### 使用示例

```javascript
import utils from '#utils';

// 生产者示例
const producer = new utils.rabbit.RabbitMQProducer();
await producer.publish('my-queue', { message: 'Hello RabbitMQ' });

// 批量发布
await producer.publishBatch('my-queue', [
  { id: 1, content: 'Message 1' },
  { id: 2, content: 'Message 2' },
]);

// 消费者示例
const consumer = new utils.rabbit.RabbitMQConsumer();
await consumer.consume('my-queue', (msg) => {
  console.log('Received message:', msg);
  return true; // 确认消息
});

// 获取队列信息
const info = await consumer.getQueueInfo('my-queue');
console.log('Queue info:', info);
```

### 5. redis.js - Redis 客户端工具

Redis 内存数据库客户端工具（基于 Bun 的 Redis 模块）。

#### 使用示例

```javascript
import utils from '#utils';

// 设置键值
await utils.redis.set('key', 'value');

// 获取键值
const value = await utils.redis.get('key');
console.log('Value:', value);

// 使用哈希表
await utils.redis.hset('user:1', { name: 'John', age: '30' });
const user = await utils.redis.hgetall('user:1');
console.log('User:', user);
```

### 6. s3.js - 腾讯云 COS 对象存储工具

腾讯云对象存储（COS）操作工具，支持文件上传、下载和管理。

#### 方法说明

- `uploadFile(bucket, key, filePath, options)`: 上传文件到 COS
- `uploadFileMultipart(bucket, key, filePath, options)`: 分片上传大文件
- `downloadFile(bucket, key, filePath)`: 下载文件
- `fileExists(bucket, key)`: 检查文件是否存在
- `getFileMetadata(bucket, key)`: 获取文件元信息
- `listFiles(bucket, prefix, options)`: 列出文件
- `deleteFile(bucket, key)`: 删除文件

#### 环境变量配置

- `TENCENT_COS_SECRET_ID`: 腾讯云 SecretId
- `TENCENT_COS_SECRET_KEY`: 腾讯云 SecretKey
- `TENCENT_COS_REGION`: COS 区域
- `TENCENT_COS_BUCKET`: 默认存储桶

#### 使用示例

```javascript
import utils from '#utils';

// 上传文件
await utils.s3.uploadFile('my-bucket', 'path/to/file.txt', './local/file.txt');

// 下载文件
await utils.s3.downloadFile('my-bucket', 'path/to/file.txt', './downloaded/file.txt');

// 检查文件是否存在
const exists = await utils.s3.fileExists('my-bucket', 'path/to/file.txt');
console.log('File exists:', exists);
```

### 7. sequelize.js - Sequelize ORM 工具

Sequelize ORM 配置工具，支持从 YAML 文件定义模型。

#### 环境变量配置

- `ORM_MODELS_DIR`: 模型定义文件目录
- `DATABASE_URL`: 数据库连接URL

#### 使用示例

```javascript
import utils from '#utils';

// 获取 Sequelize 实例
const sequelize = utils.sequelize;

// 使用模型
const User = sequelize.models.User;
const newUser = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
});

// 查询数据
const users = await User.findAll();
console.log('Users:', users);
```

### 8. sms.js - 腾讯云短信服务工具

腾讯云短信服务工具，用于发送短信验证码和通知。

#### 方法说明

- `send(phone, templateId, params)`: 发送短信

#### 环境变量配置

- `TENCENT_SMS_SECRET_ID`: 腾讯云 SecretId
- `TENCENT_SMS_SECRET_KEY`: 腾讯云 SecretKey
- `TENCENT_SMS_REGION`: 短信服务区域
- `TENCENT_SMS_APP_ID`: 短信应用ID
- `TENCENT_SMS_SIGN_NAME`: 短信签名

#### 使用示例

```javascript
import utils from '#utils';

// 发送验证码短信
await utils.sms.send('+8613800138000', '12345', ['123456']);

// 发送通知短信
await utils.sms.send('+8613800138000', '67890', ['订单号123', '100元']);
```

### 9. sql.js - SQL 语句生成工具

SQL DDL 语句生成工具，支持创建表、添加列、修改列等操作。

#### 方法说明

- `generateCreateTableSql(tableName, columns)`: 生成创建表SQL
- `generateAddColumnSql(tableName, column)`: 生成添加列SQL
- `generateModifyColumnSql(tableName, column)`: 生成修改列SQL

#### 使用示例

```javascript
import utils from '#utils';

// 生成创建表SQL
const createSql = utils.sql.generateCreateTableSql('users', [
  { name: 'id', type: 'INT', primaryKey: true, autoIncrement: true },
  { name: 'name', type: 'VARCHAR(100)', notNull: true },
  { name: 'email', type: 'VARCHAR(255)', unique: true },
]);
console.log('Create table SQL:', createSql);

// 生成添加列SQL
const addColumnSql = utils.sql.generateAddColumnSql('users', {
  name: 'age',
  type: 'INT',
  defaultValue: 0,
});
console.log('Add column SQL:', addColumnSql);
```

### 10. yml.validate.js - YAML 验证工具

YAML 规则验证工具，基于 JSON Schema 验证数据格式。

#### 方法说明

- `createYamlValidator(yml_file_path)`: 创建 YAML 验证器

#### 使用示例

```javascript
import utils from '#utils';

// 创建验证器
const validate = utils.createYamlValidator('./validation-rules.yml');

// 验证数据
const data = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
};

const isValid = validate(data);
if (!isValid) {
  console.log('Validation errors:', validate.errors);
} else {
  console.log('Data is valid');
}
```

## 环境变量配置

大多数工具都需要相应的环境变量配置，请参考各工具的说明部分。

## 测试

工具包包含完整的测试套件：

```bash
# 运行所有测试
bun test

# 运行特定工具测试
bun test tests/rabbit.test.js
```

## 贡献指南

1. 添加新工具时，请在相应文件中实现功能
2. 在 `index.js` 中导出工具
3. 在 `README.md` 中添加文档
4. 编写相应的测试用例
5. 确保所有测试通过

```
ffmpeg -i watermark.png -vf "format=rgba,rotate=30*PI/180:c=none,colorchannelmixer=aa=1.0" -frames:v 1 test.png
```
