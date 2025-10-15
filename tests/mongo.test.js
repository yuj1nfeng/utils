import * as t from 'bun:test';
import utils from '../index.js';
const mongo = utils.mongo;

const titles = new Array(utils.mk.random.integer(1, 1)).fill(null).map((p) => utils.mk.random.city());
t.describe.each(titles)('🍉🍉🍉  Mongo', async (test_table) => {
  // 测试前清空测试表
  t.beforeEach(async () => {
    await mongo.dropTable(test_table);
  });
  // 测试后清空测试表
  t.beforeEach(async () => {
    await mongo.dropTable(test_table);
  });

  const fmt = (str) => `${test_table}\t${str.padEnd(36, ' ')} 👈`;

  t.it(fmt('Insert One'), async () => {
    const doc = { name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100) };
    const result = await mongo.insertOne(test_table, doc);
    t.expect(result.name).toEqual(doc.name);
  });

  t.it(fmt('Insert Many'), async () => {
    const users = [];
    for (let index = 0; index < 1000; index++) users.push({ name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100) });
    const result = await mongo.insertMany(test_table, users);
    t.expect(result.insertedCount).toBe(users.length);
  });

  t.it(fmt('Find'), async () => {
    const doc = { name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100) };
    const inserted = await mongo.insertOne(test_table, doc);
    const found = await mongo.findOne(test_table, inserted.id);
    t.expect(found.name).toBe(doc.name);
  });

  t.it(fmt('Update'), async () => {
    const doc = { name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100) };
    const result = await mongo.insertOne(test_table, doc);
    const updateResult = await mongo.updateOne(test_table, result.id, { age: 21 });
    t.expect(updateResult).toBe(true);
  });

  t.it(fmt('Delete'), async () => {
    const doc = { name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100) };
    const result = await mongo.insertOne(test_table, doc);
    const deleteResult = await mongo.deleteOne(test_table, result.id);
    t.expect(deleteResult).toBe(true);
  });

  t.it(fmt('Query'), async () => {
    const test_id = utils.id.uuid();
    const total = utils.mk.random.integer(100, 300);
    for (let index = 0; index < total; index++) await mongo.insertOne(test_table, { name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100), test: test_id });

    const docs = await mongo.query(test_table, { test: test_id });
    t.expect(docs.length).toBe(total);
  });

  t.it(fmt('Pagination'), async () => {
    const limit = 20;
    const docs = new Array(utils.mk.random.integer(limit, 100)).fill(null).map(() => ({
      name: utils.mk.random.cname(),
      age: utils.mk.random.integer(limit, 100),
      test: utils.id.uuid(),
    }));
    await mongo.insertMany(test_table, docs);
    const test_ids = docs.map((doc) => doc.test);

    const { rows, total } = await mongo.paginate(test_table, { test: { $in: test_ids } }, limit, 0);

    t.expect(rows.length).toBe(limit);
    t.expect(total).toBe(test_ids.length);
  });

  t.it(fmt('Aggregate'), async () => {
    const test_id = utils.id.uuid();
    const count = utils.mk.random.integer(1, 5000);
    const docs = new Array(count).fill(null).map(() => ({ name: utils.mk.random.cname(), age: utils.mk.random.integer(1, 100), test: test_id }));
    await mongo.insertMany(test_table, docs);
    const result = await mongo.aggregate(test_table, [{ $match: { test: test_id } }, { $group: { _id: null, total: { $sum: 1 } } }]);
    t.expect(result[0].total).toBe(count);
  });
});
