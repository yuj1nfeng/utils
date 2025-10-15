import { Etcd3 } from 'etcd3';

let instance = null;

const getClient = () => {
  if (instance !== null) return instance;
  const hosts = process.env['ETCD_HOSTS'];
  if (!hosts) throw new Error(' please set ETCD_HOSTS');
  instance = new Etcd3({ hosts });
  return instance;
};

export default {
  /**
   * 异步存储键值对到客户端。
   *
   * @param {string} key - 要存储的键。
   * @param {*} value - 要存储的值。
   * @returns {Promise<void>} 无返回值，操作完成后解析。
   */
  async put(key, value) {
    const client = getClient();
    await client.put(key).value(value);
  },

  /**
   * 根据指定的键从客户端获取对应的字符串值。
   *
   * @async
   * @param {string} key - 要获取的值的键。
   * @returns {Promise<string>} 返回一个 Promise，解析为与键关联的字符串值。
   * @throws {Error} 如果获取过程中发生错误，抛出异常。
   */
  async get(key) {
    const client = getClient();
    const value = await client.get(key).string();
    return value;
  },

  /**
   * 删除指定键的数据。
   * @param {string} key - 要删除的数据的键。
   * @returns {Promise<void>} 无返回值，操作成功时完成 Promise。
   * @throws {Error} 如果删除操作失败，抛出错误。
   */
  async delete(key) {
    const client = getClient();
    await client.delete().key(key);
  },

  /**
   * 异步获取分布式锁。
   *
   * @param {string} key - 锁的唯一标识符。
   * @param {number} ttl - 锁的生存时间（Time To Live），单位为毫秒。
   * @returns {Promise<boolean>} 返回一个 Promise，解析为布尔值表示是否成功获取锁。
   */
  async lock(key, ttl) {
    const client = getClient();
    return client.lock(key, ttl);
  },

  /**
   * 删除指定前缀的所有数据。
   * @param {string} prefix - 用于筛选数据的前缀字符串。
   * @returns {Promise<void>} 无返回值，异步操作完成后表示删除成功。
   * @throws {Error} 如果删除过程中发生错误，抛出异常。
   */
  async deleteAll(prefix) {
    const client = getClient();
    const keys = await client.getAll().prefix(prefix).keys();
    if (keys.length > 0) {
      await client.delete().prefix(prefix);
    }
  },

  /**
   * 监听指定键的变化，并在键的值发生变化时触发回调函数。
   *
   * @param {string} key - 需要监听的键。
   * @param {Function} callback - 当键的值发生变化时触发的回调函数。
   *                            回调函数接收一个对象参数，包含以下字段：
   *                            - key: 发生变化的键（字符串）。
   *                            - value: 键的新值（字符串），如果键被删除则为 null。
   * @returns {Object} 返回一个包含取消监听方法的对象：
   *                  - cancel: 调用此方法可以取消监听。
   */
  async watch(key, callback) {
    const client = getClient();
    const watcher = await client.watch().key(key).create();
    watcher.on('put', (response) => {
      callback({ key: response.key.toString(), value: response.value.toString() });
    });
    watcher.on('delete', (response) => {
      callback({ key: response.key.toString(), value: null });
    });
    return {
      cancel: () => watcher.cancel(),
    };
  },

  /**
   * 关闭当前客户端连接并清空实例。
   * 如果客户端不存在，则直接返回。
   * @async
   */
  async close() {
    const client = getClient();
    if (!client) return;
    await client.close();
    instance = null;
  },

  getClient,
};
