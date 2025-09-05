import { S3Client } from 'bun';

// 检查必要的腾讯云COS环境变量是否已设置
if (!process.env['TENCENT_CLOUD_SECRET_ID']) throw new Error('未设置环境变量 TENCENT_CLOUD_SECRET_ID');
if (!process.env['TENCENT_CLOUD_SECRET_KEY']) throw new Error('未设置环境变量 TENCENT_CLOUD_SECRET_KEY');
if (!process.env['TENCENT_CLOUD_COS_BUCKET']) throw new Error('未设置环境变量 TENCENT_CLOUD_COS_BUCKET');
if (!process.env['TENCENT_CLOUD_COS_REGION']) throw new Error('未设置环境变量 TENCENT_CLOUD_COS_REGION');
if (!process.env['TENCENT_CLOUD_COS_ENDPOINT']) throw new Error('未设置环境变量 TENCENT_CLOUD_COS_ENDPOINT');

/**
 * 创建腾讯云COS S3客户端实例
 */
export const client = new S3Client({
    accessKeyId: process.env['TENCENT_CLOUD_SECRET_ID'], // 腾讯云SecretId
    secretAccessKey: process.env['TENCENT_CLOUD_SECRET_KEY'], // 腾讯云SecretKey
    bucket: process.env['TENCENT_CLOUD_COS_BUCKET'], // COS存储桶名称
    region: process.env['TENCENT_CLOUD_COS_REGION'], // COS地域
    endpoint: process.env['TENCENT_CLOUD_COS_ENDPOINT'], // COS访问域名
    virtualHostedStyle: true, // 使用虚拟托管样式
});

/**
 * 根据给定的对象存储键（key）生成公开访问的URL。
 * 使用环境变量 `TENCENT_CLOUD_COS_ENDPOINT` 作为基础URL。
 *
 * @param {string} key - 对象存储中的文件键（路径）。
 * @returns {string} 完整的公开访问URL。
 */
function getPublicUrl(key) {
    return `${process.env['TENCENT_CLOUD_COS_ENDPOINT']}/${key}`;
}

/**
 * 获取S3文件对象
 * @param {string} key 文件在COS中的key
 * @returns {S3File} S3文件对象
 */
function getS3File(key) {
    const s3file = client.file(key);
    return s3file;
}

/**
 * @async
 * @function getText 获取文本文件内容
 * @param {string} key 文件在COS中的key
 * @returns {Promise<string>} 文件文本内容
 */
async function getText(key) {
    const s3file = getS3File(key);
    const text = await s3file.text();
    return text;
}

/**
 * @async
 * @function put 上传文本内容到COS
 * @param {string} key 文件在COS中的key
 * @param {string} data 要上传的文本内容
 */
async function put(key, data) {
    await client.write(key, data, { type: 'text/plain' });
}

/**
 * @async
 * @function putFile 上传文件到COS （支持大文件分片上传）
 * @param {string} key 文件在COS中的key
 * @param {string|ArrayBuffer} file 文件路径或ArrayBuffer数据
 * @param {Object} options 上传选项
 */
async function putFile(key, file, options = {}) {
    let buf = file instanceof ArrayBuffer ? file : await Bun.file(file).arrayBuffer();

    // 小文件直接上传（小于50MB）
    if (buf.byteLength <= 1024 * 1024 * 50) {
        await client.write(key, buf, { ...options });
        return;
    }

    // 大文件分片上传
    const s3file = client.file(key);
    const chunkSize = 1024 * 1024 * 50; // 每片50MB
    const writer = s3file.writer({
        retry: 3, // 重试次数
        queueSize: 10, // 队列大小
        partSize: chunkSize, // 分片大小
        ...options,
    });

    const totalSize = buf.byteLength;
    let uploadedSize = 0;

    // 分片上传
    for (let i = 0; i < totalSize; i += chunkSize) {
        const chunk = buf.slice(i, i + chunkSize);
        writer.write(chunk);
        uploadedSize += chunk.byteLength;
        await writer.flush();
    }

    await writer.end();
}

/**
 * @async
 * @function exists 检查文件是否存在
 * @param {string} key 文件在COS中的key
 * @returns {Promise<boolean>} 文件是否存在
 */
async function exists(key) {
    const result = await client.exists(key);
    return result;
}

/**
 * @async
 * @function stat 获取文件元信息
 * @param {string} key 文件在COS中的key
 * @returns {Promise<Object>} 文件元信息
 */
async function stat(key) {
    const result = await client.stat(key);
    return result;
}

/**
 * @async
 * @function list 列出存储桶中的文件
 * @param {string} prefix 文件前缀
 * @param {number} maxKeys 最大返回数量
 * @returns {Promise<Object>} 文件列表
 */
async function list(prefix = '', maxKeys = 1000) {
    const result = await client.list({ prefix: prefix, maxKeys: maxKeys });
    return result;
}

/**
 * @async
 * @function del 删除文件
 * @param {string} key 文件在COS中的key
 * @returns {Promise<Object>} 删除结果
 */
async function del(key) {
    const result = await client.delete(key);
    return result;
}

// 导出所有方法
export default {
    getPublicUrl,
    getS3File,
    getText,
    put,
    putFile,
    exists,
    stat,
    list,
    del,
};
