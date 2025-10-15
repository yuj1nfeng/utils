import * as t from 'bun:test';
import utils from '../index.js';
const s3 = utils.s3;

t.describe('S3', async () => {
  const test_key = 'package.json';
  const test_file = 'package.json';

  t.beforeAll(async () => {
    await s3.del(test_key);
  });
  t.afterAll(async () => {
    await s3.del(test_key);
  });

  const fmt = (str) => `${str.padEnd(36, ' ')} 👈`;

  t.it(fmt('Upload File'), async () => {
    await s3.putFile(test_key, test_file);
    const text = await s3.getText(test_key);
    const file_content = await Bun.file(test_file).text();
    t.expect(file_content).toEqual(text);
  });

  t.it(fmt('Delete File'), async () => {
    await s3.putFile(test_key, test_file);
    await s3.del(test_key);
    const exists = await s3.exists(test_key);
    t.expect(exists).toBe(false);
  });

  t.it(fmt('List'), async () => {
    await s3.putFile(test_key, test_file);
    const exists = await s3.exists(test_key);
    t.expect(exists).toBe(true);
    const { contents } = await s3.list();
    const keys = contents.map((object) => object.key);
    t.expect(keys).toContain(test_key);
  });

  t.it(fmt('Get URL'), async () => {
    await s3.putFile(test_key, test_file);
    const url = s3.getPublicUrl(test_key);
    const result = await Bun.fetch(url);
    t.expect(result.status).toBe(200);
  });

  t.it(fmt('Get Text'), async () => {
    await s3.putFile(test_key, test_file);
    const text = await s3.getText(test_key);
    const file_content = await Bun.file(test_file).text();
    t.expect(file_content).toEqual(text);
  });

  t.it(fmt('Put Text'), async () => {
    await s3.put(test_key, '123');
    const result = await s3.getText(test_key);
    t.expect(result).toBe('123');
  });

  t.it(fmt('Get Stats'), async () => {
    await s3.putFile(test_key, test_file);
    const stats = await s3.stat(test_key);
    const file = Bun.file(test_file);
    t.expect(file.size).toEqual(stats.size);
  });
});
