import amqplib from 'amqplib';

// if (!process.env['RABBITMQ_URL']) throw new Error('environment variable RABBITMQ_URL is not set');

let connection = null;
let channels = new Map();

/**
 * 创建 RabbitMQ 连接
 * @returns {Promise<amqplib.Connection>} RabbitMQ 连接实例
 * @throws {Error} 如果连接失败或环境变量未设置
 */
const createConnection = async () => {
  if (!connection) {
    connection = await amqplib.connect(process.env['RABBITMQ_URL']);
    console.log('RabbitMQ connected successfully');
  }
  return connection;
};

/**
 * 获取 RabbitMQ 通道（单例模式）
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<amqplib.Channel>} RabbitMQ 通道实例
 * @throws {Error} 如果获取通道失败
 */
const getChannel = async (channelName = 'default') => {
  if (!channels.has(channelName)) {
    const conn = await createConnection();
    const channel = await conn.createChannel();
    channels.set(channelName, channel);
  }
  return channels.get(channelName);
};

/**
 * 声明队列
 * @param {string} queueName - 队列名称
 * @param {Object} [options={}] - 队列选项
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<amqplib.Replies.AssertQueue>} 队列声明结果
 */
const assertQueue = async (queueName, options = {}, channelName = 'default') => {
  const channel = await getChannel(channelName);
  return await channel.assertQueue(queueName, {
    durable: true,
    ...options,
  });
};

/**
 * 声明交换机
 * @param {string} exchangeName - 交换机名称
 * @param {string} type - 交换机类型（direct, fanout, topic, headers）
 * @param {Object} [options={}] - 交换机选项
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<amqplib.Replies.AssertExchange>} 交换机声明结果
 */
const assertExchange = async (exchangeName, type, options = {}, channelName = 'default') => {
  const channel = await getChannel(channelName);
  return await channel.assertExchange(exchangeName, type, {
    durable: true,
    ...options,
  });
};

/**
 * 绑定队列到交换机
 * @param {string} queueName - 队列名称
 * @param {string} exchangeName - 交换机名称
 * @param {string} [pattern=''] - 路由模式
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<amqplib.Replies.Empty>} 绑定结果
 */
const bindQueue = async (queueName, exchangeName, pattern = '', channelName = 'default') => {
  const channel = await getChannel(channelName);
  return await channel.bindQueue(queueName, exchangeName, pattern);
};

/**
 * 发布消息
 * @param {string} queueName - 队列名称
 * @param {any} message - 消息内容
 * @param {Object} [options={}] - 发布选项
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<boolean>} 发布是否成功
 */
const publishToQueue = async (queueName, message, options = {}, channelName = 'default') => {
  const channel = await getChannel(channelName);
  return channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
    ...options,
  });
};

/**
 * 发布消息到交换机
 * @param {string} exchangeName - 交换机名称
 * @param {string} routingKey - 路由键
 * @param {any} message - 消息内容
 * @param {Object} [options={}] - 发布选项
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<boolean>} 发布是否成功
 */
const publishToExchange = async (exchangeName, routingKey, message, options = {}, channelName = 'default') => {
  const channel = await getChannel(channelName);
  return channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)), {
    persistent: true,
    ...options,
  });
};

/**
 * 消费消息
 * @param {string} queueName - 队列名称
 * @param {Function} callback - 消息处理回调函数
 * @param {Object} [options={}] - 消费选项
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<amqplib.Replies.Consume>} 消费结果
 */
const consume = async (queueName, callback, options = {}, channelName = 'default') => {
  const channel = await getChannel(channelName);
  return await channel.consume(
    queueName,
    async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg);
          channel.ack(msg);
        } catch (error) {
          console.error('Message processing error:', error);
          channel.nack(msg, false, false);
        }
      }
    },
    {
      noAck: false,
      ...options,
    },
  );
};

/**
 * 关闭 RabbitMQ 连接
 * @returns {Promise<void>} 无返回值
 */
const closeConnection = async () => {
  if (connection) {
    await connection.close();
    connection = null;
    channels.clear();
    console.log('RabbitMQ connection closed');
  }
};

/**
 * 获取消息数量
 * @param {string} queueName - 队列名称
 * @param {string} [channelName='default'] - 通道名称
 * @returns {Promise<amqplib.Replies.AssertQueue>} 队列信息
 */
const getQueueInfo = async (queueName, channelName = 'default') => {
  const channel = await getChannel(channelName);
  return await channel.checkQueue(queueName);
};

/**
 * RabbitMQ 消息生产者类
 * 用于向指定队列发布消息
 */
class RabbitMQProducer {
  /**
   * 发布消息到指定队列
   * @param {string} queueName - 队列名称
   * @param {Object} message - 消息内容
   * @param {Object} options - 发布选项
   * @returns {Promise<boolean>} 发布结果
   */
  async publish(queueName, message, options = {}) {
    try {
      const result = await publishToQueue(queueName, message, options);
      console.log(`消息发布成功到队列: ${queueName}`, message);
      return result;
    } catch (error) {
      console.error(`发布消息到队列 ${queueName} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量发布消息
   * @param {string} queueName - 队列名称
   * @param {Array} messages - 消息数组
   * @param {Object} options - 发布选项
   * @returns {Promise<Array>} 发布结果数组
   */
  async publishBatch(queueName, messages, options = {}) {
    const results = [];
    for (const message of messages) {
      try {
        const result = await this.publish(queueName, message, options);
        results.push({ success: true, message, result });
      } catch (error) {
        results.push({ success: false, message, error: error.message });
      }
    }
    return results;
  }

  /**
   * 关闭连接
   * @returns {Promise<void>}
   */
  async close() {
    await closeConnection();
  }
}

/**
 * RabbitMQ 消息消费者类
 * 用于从指定队列消费消息
 */
class RabbitMQConsumer {
  constructor() {
    this.consumers = new Map();
  }

  /**
   * 消费指定队列的消息
   * @param {string} queueName - 队列名称
   * @param {Function} messageHandler - 消息处理函数
   * @param {Object} options - 消费选项
   * @returns {Promise<void>}
   */
  async consume(queueName, messageHandler, options = {}) {
    try {
      // 确保队列存在
      await assertQueue(queueName, options.queueOptions || {});

      const channel = await getChannel(queueName);

      // 消费消息
      await channel.consume(
        queueName,
        async (msg) => {
          if (msg !== null) {
            try {
              const content = JSON.parse(msg.content.toString());
              await messageHandler(content, msg);
              channel.ack(msg);
            } catch (error) {
              console.error(`处理消息失败 (队列: ${queueName}):`, error);
              channel.nack(msg);
            }
          }
        },
        options.consumeOptions || { noAck: false },
      );

      console.log(`开始消费队列: ${queueName}`);
      this.consumers.set(queueName, { channel, messageHandler });
    } catch (error) {
      console.error(`启动消费者失败 (队列: ${queueName}):`, error);
      throw error;
    }
  }

  /**
   * 停止消费指定队列
   * @param {string} queueName - 队列名称
   * @returns {Promise<void>}
   */
  async stopConsuming(queueName) {
    const consumer = this.consumers.get(queueName);
    if (consumer) {
      await consumer.channel.cancel(queueName);
      this.consumers.delete(queueName);
      console.log(`已停止消费队列: ${queueName}`);
    }
  }

  /**
   * 获取队列信息
   * @param {string} queueName - 队列名称
   * @returns {Promise<Object>} 队列信息
   */
  async getQueueInfo(queueName) {
    return await getQueueInfo(queueName);
  }

  /**
   * 关闭连接
   * @returns {Promise<void>}
   */
  async close() {
    for (const [queueName] of this.consumers) {
      await this.stopConsuming(queueName);
    }
    await closeConnection();
  }
}

export default {
  createConnection,
  getChannel,
  assertQueue,
  assertExchange,
  bindQueue,
  publishToQueue,
  publishToExchange,
  consume,
  closeConnection,
  getQueueInfo,
  RabbitMQProducer,
  RabbitMQConsumer,
};
