import { MongoClient, ObjectId, Collection } from 'mongodb';

let instance = null;

/**
 * 创建 MongoDB 客户端实例
 * @returns {Promise<MongoClient>} MongoDB 客户端实例
 * @throws {Error} 如果连接失败或环境变量未设置
 */
const newClient = async () => {
  const url = process.env['MONGO_URL'];
  if (!url) throw new Error('environment variable MONGO_URL is not set');
  let client = new MongoClient(url, { maxPoolSize: 10, minPoolSize: 1, retryWrites: true });
  await client.connect();
  return client;
};

/**
 * 获取 MongoDB 数据库实例（单例模式）
 * @returns {Promise<Db>} MongoDB 数据库实例
 * @throws {Error} 如果连接失败或环境变量未设置
 */
const getInstance = async () => {
  if (!instance) {
    let client = await newClient();
    instance = client.db();
  }
  return instance;
};

/**
 * 关闭 MongoDB 数据库连接
 * @returns {Promise<void>} 无返回值
 * @throws {Error} 如果关闭连接时发生错误
 */
const close = async () => {
  if (instance) {
    await instance.client.close();
    instance = null;
  }
};

/**
 * 记录审计日志
 * @param {string} action - 操作类型（如 'insert', 'update', 'delete'）
 * @param {string} collectionName - 集合名称
 * @param {Object} detail - 操作详情
 * @returns {Promise<void>} 无返回值
 * @throws {Error} 如果记录日志失败
 */
const auditLog = async (action, collectionName, detail) => {
  const db = await getInstance();
  await db.collection('audit_log').insertOne({ action, collection: collectionName, timestamp: new Date(), ...detail });
};

/**
 * 向指定集合插入一条文档
 * @param {string} collectionName - 集合名称
 * @param {Object} doc - 要插入的文档对象
 * @param {Object} [auditInfo=null] - 审计日志信息（可选）
 * @returns {Promise<Object|boolean>} 插入成功返回文档，文档已存在返回 false
 * @throws {Error} 如果插入失败或参数无效
 */
const insertOne = async (collectionName, doc, auditInfo = null) => {
  const db = await getInstance();
  const objid = ObjectId.createFromHexString(Bun.randomUUIDv7().replace(/-/g, '').substring(0, 24));
  if (!doc.id) doc.id = objid.toString();
  doc._id = objid;

  const count = await db.collection(collectionName).countDocuments({ id: doc.id });
  if (count > 0) return false;
  const result = await db.collection(collectionName).insertOne(doc);
  if (auditInfo) auditLog('insert', collectionName, { doc: result, ...auditInfo });
  delete doc._id;
  return doc;
};

/**
 * 根据 ID 删除一条文档
 * @param {string} collectionName - 集合名称
 * @param {string} id - 文档 ID
 * @param {Object} [auditInfo=null] - 审计日志信息（可选）
 * @returns {Promise<boolean>} 删除成功返回 true，文档不存在返回 false
 * @throws {Error} 如果删除失败或参数无效
 */
const deleteOne = async (collectionName, id, auditInfo = null) => {
  const db = await getInstance();
  const doc = await findOne(collectionName, id);
  if (!doc) return false;
  if (auditInfo) auditLog('delete', collectionName, { doc, ...auditInfo });
  const result = await db.collection(collectionName).deleteOne({ id: id });
  return result.deletedCount > 0;
};

/**
 * 根据 ID 更新一条文档
 * @param {string} collectionName - 集合名称
 * @param {string} id - 文档 ID
 * @param {Object} update - 更新操作（如 $set, $inc 等）
 * @param {Object} [auditInfo=null] - 审计日志信息（可选）
 * @returns {Promise<boolean>} 更新成功返回 true，文档不存在返回 false
 * @throws {Error} 如果更新失败或参数无效
 */
const updateOne = async (collectionName, id, update, auditInfo = null) => {
  const db = await getInstance();
  const doc = await findOne(collectionName, id);
  if (!doc) return false;
  if (auditInfo) auditLog('update', collectionName, { doc, set: update, ...auditInfo });
  const result = await db.collection(collectionName).updateOne({ id: id }, { $set: update });
  return result.modifiedCount > 0;
};

/**
 * 根据 ID 查询一条文档
 * @param {string} collectionName - 集合名称
 * @param {string} id - 文档 ID
 * @returns {Promise<Object|null>} 查询到的文档，如果未找到则返回 null
 * @throws {Error} 如果查询失败或参数无效
 */
const findById = async (collectionName, id) => {
  const db = await getInstance();
  const doc = await db.collection(collectionName).findOne({ id: id });
  if (!doc) return null;
  const new_id = doc._id.toString();
  delete doc._id;
  return { id: new_id, ...doc };
};

/**
 * 查询一条文档
 * @param {string} collectionName - 集合名称
 * @param {object} filter - 查询条件
 * @returns {Promise<Object|null>} 查询到的文档，如果未找到则返回 null
 * @throws {Error} 如果查询失败或参数无效
 */
const findOne = async (collectionName, filter = {}) => {
  const db = await getInstance();
  const doc = await db.collection(collectionName).findOne(filter);
  if (!doc) return null;
  const new_id = doc._id.toString();
  delete doc._id;
  return { id: new_id, ...doc };
};

/**
 * 分页查询文档
 * @param {string} collectionName - 集合名称
 * @param {Object} [filter={}] - 查询条件
 * @param {number} [skip=0] - 跳过的文档数量
 * @param {number} [limit=10] - 每页文档数量
 * @returns {Promise<{total: number, rows: Array}>} 分页结果，包含总数量和当前页数据
 * @throws {Error} 如果查询失败或参数无效
 */
const paginate = async (collectionName, filter = {}, limit = 10, skip = 0) => {
  const db = await getInstance();
  const count = await db.collection(collectionName).countDocuments(filter);
  const cursor = db.collection(collectionName).find(filter).skip(skip).limit(limit);
  const list = await cursor.toArray();
  return { total: count, rows: list };
};

/**
 * 查询文档列表
 * @param {string} collectionName - 集合名称
 * @param {Object} [filter={}] - 查询条件
 * @returns {Promise<Array>} 查询到的文档数组
 * @throws {Error} 如果查询失败或参数无效
 */
const query = async (collectionName, filter = {}) => {
  const db = await getInstance();
  const cursor = db.collection(collectionName).find(filter);
  const list = await cursor.toArray();
  return list;
};

/**
 * 批量插入文档
 * @param {string} collectionName
 * @param {[]} docs
 * @returns
 */
const insertMany = async (collectionName, docs) => {
  const db = await getInstance();
  return db.collection(collectionName).insertMany(docs);
};

/**
 * 批量执行写操作
 * @param {string} collectionName - 集合名称
 * @param {Array} operations - 批量操作数组
 * @returns {Promise<BulkWriteResult>} 批量操作结果
 * @throws {Error} 如果批量操作失败或参数无效
 */
const bulkWrite = async (collectionName, operations) => {
  const db = await getInstance();
  return db.collection(collectionName).bulkWrite(operations);
};

/**
 * 执行聚合查询
 * @param {string} collectionName - 集合名称
 * @param {Array} pipeline - 聚合管道
 * @returns {Promise<Array>} 聚合查询结果
 * @throws {Error} 如果聚合查询失败或参数无效
 */
const aggregate = async (collectionName, pipeline) => {
  const db = await getInstance();
  return db.collection(collectionName).aggregate(pipeline).toArray();
};

/** 统计文档数量
 * @param {string} collectionName - 集合名称
 * @param {Object} [filter={}] - 查询条件
 * @returns {Promise<number>} 文档数量
 * @throws {Error} 如果统计失败或参数无效
 */
const count = async (collectionName, filter = {}) => {
  const db = await getInstance();
  return db.collection(collectionName).countDocuments(filter);
};

/**
 * 删除集合
 * @param {string} collectionName - 集合名称
 * @returns {Promise<boolean>} 删除成功返回 true
 * @throws {Error} 如果删除失败或参数无效
 */
const dropTable = async (collectionName) => {
  const db = await getInstance();
  const result = await db.collection(collectionName).drop();
  return result;
};

/**
 * 获取集合
 * @param {string} collectionName - 集合名称
 * @returns {Promise<Collection>} 删除成功返回 true
 * @throws {Error} 如果删除失败或参数无效
 */
const table = async (collectionName) => {
  const db = await getInstance();
  const result = await db.collection(collectionName);
  return result;
};

export default {
  newClient,
  getInstance,
  close,
  insertOne,
  insertMany,
  bulkWrite,
  deleteOne,
  updateOne,
  findById,
  findOne,
  paginate,
  query,
  aggregate,
  count,
  dropTable,
  table,
};
