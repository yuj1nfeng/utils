import etcd from './etcd.js';
import mongo from './mongo.js';
import rabbit from './rabbit.js';
import redis from './redis.js';
import sql from './sql.js';
import s3 from './s3.js';
import sms from './sms.js';
import sequelize from './sequelize.js';
import mk from './mk.js';
import id from './id.js';
import deepseek from './deepseek.js';
import logger from './logger.js';
import buildSeqFilter from './cmd/seq.filter.js';
import buildMongoFilter from './cmd/mongo.filter.js';
import genZodSchema from './cmd/gen.zod.schema.js';
import genSeqSchema from './cmd/gen.seq.schema.js';
import genMockTemplate from './cmd/gen.mock.template.js';

export default {
    etcd,
    mongo,
    rabbit,
    redis,
    sql,
    s3,
    sms,
    sequelize,
    mk,
    id,
    deepseek,
    logger,
    cmd: {
        buildSeqFilter,
        buildMongoFilter,
        genZodSchema,
        genSeqSchema,
        genMockTemplate
    },
};
