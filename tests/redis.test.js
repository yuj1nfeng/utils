import * as t from 'bun:test';
import utils from '#utils';
const redis = utils.redis;

t.describe('🚩🚩🚩 Redis', async () => {
    const fmt = (str) => `${str.padEnd(36, ' ')} 👈`;

    t.it(fmt('Set & Get'), async () => {
        const key = 'test-set-get';
        const value = 'hello world';
        // set value
        t.expect(await redis.set(key, value)).toBe('OK');
        // get value
        t.expect(await redis.get(key)).toEqual(value);
        // cleanup
        await redis.del(key);
    });

    t.it(fmt('Set With Expiry'), async () => {
        const key = 'test-expire';
        const value = 'will expire';
        // set value with expiry time in 1 second
        await redis.set(key, value, 'ex', 1);
        // now get value should exist
        t.expect(await redis.get(key)).toEqual(value);
        // sleep 1.5 seconds
        await Bun.sleep(1500);
        // now get value should return null
        t.expect(await redis.get(key)).toBeNull();
    });

    t.it(fmt('Delete'), async () => {
        const key = 'test-delete';
        // set a value to delete
        await redis.set(key, 'to be deleted');
        // delete the key
        t.expect(await redis.del(key)).toBe(1);
        // try to get the deleted key , should return null
        t.expect(await redis.get(key)).toBeNull();
    });

    t.it(fmt('Non-Exist Key'), async () => {
        const nonExistKey = 'non-exist-key';
        await redis.del(nonExistKey);
        // trying to get a non-existing key should return null
        t.expect(await redis.get(nonExistKey)).toBeNull();
    });

    t.it(fmt('Incr & Decr'), async () => {
        const key = 'test-incr';
        // ensure the key is deleted before test
        await redis.del(key);
        // increment the key
        t.expect(await redis.get(key)).toBeNull();
        // incrementing a non-existing key should return 1
        for (let i = 0; i < 5; i++) await redis.incr(key);
        // now the key should be 5
        t.expect(parseInt(await redis.get(key))).toEqual(5);
        // decrement the key
        for (let i = 0; i < 10; i++) await redis.decr(key);
        // now the key should be -5
        t.expect(parseInt(await redis.get(key))).toEqual(-5);
    });

    t.it(fmt('Ttl'), async () => {
        const key = 'test-ttl';
        // set a key with 2 seconds expiry
        await redis.set(key, 'will expire', 'ex', 2);
        // get the value
        t.expect(await redis.get(key)).toEqual('will expire');
        // check the ttl
        const ttl = await redis.ttl(key);
        t.expect(ttl).toBeLessThanOrEqual(2);
        // wait for 2.5 seconds
        await Bun.sleep(2500);
        //  now the key should be expired , so get should return null
        t.expect(await redis.get(key)).toBeNull();
    });

    t.it(fmt('Exists'), async () => {
        const key = 'test-exists';
        await redis.set(key, 'exists');
        // 检查键是否存在
        t.expect(await redis.exists(key)).toBe(true);
        // 删除键
        await redis.del(key);
        // 再次检查键是否存在
        t.expect(await redis.exists(key)).toBe(false);
    });

    t.it(fmt('List Operations'), async () => {
        const key = 'test-list';
        await redis.del(key);
        // 测试列表操作
        await redis.rpush(key, 'item1');
        await redis.rpush(key, 'item2');
        await redis.rpush(key, 'item3');

        // 获取列表长度
        t.expect(await redis.llen(key)).toBe(3);

        // 获取列表所有元素
        const list = await redis.send('LRANGE', [key, '0', '-1']);
        t.expect(list).toEqual(['item1', 'item2', 'item3']);

        // 删除列表
        await redis.del(key);
    });

    t.it(fmt('Hash Operations'), async () => {
        const key = 'test-user-hash:123';
        await redis.del(key);

        await redis.hmset(key, ['name', 'Alice', 'email', 'alice@example.com', 'active', 'true']);

        // Get multiple fields from a hash
        const userFields = await redis.hmget(key, ['name', 'email']);
        t.expect(userFields).toEqual(['Alice', 'alice@example.com']);

        // Increment a numeric field in a hash
        await redis.hincrby(key, 'visits', 1);
        const [visits] = await redis.hmget(key, ['visits']);
        t.expect(parseInt(visits)).toEqual(1);

        // Increment a float field in a hash
        await redis.hincrbyfloat(key, 'score', 1.5);
        const [score] = await redis.hmget(key, ['score']);
        t.expect(parseFloat(score)).toBeCloseTo(1.5, 1);
    });

    t.it(fmt('Set Operations'), async () => {
        const key = 'test-set-expire';
        const value = 'javascript';
        const members = ['python', 'java', 'javascript', 'c++'];
        // Add member to set
        await redis.sadd(key, value);
        t.expect(await redis.sismember(key, value)).toBe(true);
        // Remove member from set
        await redis.srem(key, value);
        t.expect(await redis.sismember(key, value)).toBe(false);

        // Add multiple members to a set

        for (const member of members) await redis.sadd(key, member);
        // Get all members of a set
        const all_tags = await redis.smembers(key);
        t.expect(all_tags.sort()).toEqual(members.sort());
        // Get a random member
        const random_tag = await redis.srandmember(key);
        t.expect(all_tags).toContain(random_tag);

        // Pop (remove and return) a random member
        const popped_tag = await redis.spop(key);
        t.expect(all_tags).toContain(popped_tag);
        t.expect(await redis.sismember(key, popped_tag)).toBe(false);

        // Get the number of members in a set
        const count = await redis.scard(key);
        t.expect(count).toBe(members.length - 1); // One member was popped
    });
});
