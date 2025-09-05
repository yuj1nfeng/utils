import * as t from 'bun:test';
import utils from '#utils';
const etcd = utils.etcd;

const keys = new Array(utils.mk.random.integer(1, 1)).fill(null).map((p) => utils.mk.random.city());

t.describe.each(keys)('🚀🚀 ETCD', async (key) => {
    t.beforeAll(async () => {
        // 清理测试数据
        await etcd.deleteAll(key);
    });
    t.afterAll(async () => {
        await etcd.deleteAll(key);
        await etcd.close();
    });

    const fmt = (str) => `${key} ${str.padEnd(36, '')} 👈`;

    t.it(fmt(`😄 Set 👉 Get 👉 Delete`), async () => {
        const value = utils.mk.random.ctitle();
        for (let i = 0; i < 128; i++) {
            await etcd.put(key, value);
            t.expect(await etcd.get(key)).toEqual(value);
            await etcd.delete(key);
            t.expect(await etcd.get(key)).toBe(null);
            await etcd.put(key, value);
            t.expect(await etcd.get(key)).toEqual(value);
        }
    });
    t.it(fmt('👀 Watch 👀 '), async () => {
        const value = utils.mk.random.ctitle();
        let changed = false;

        // 设置监听
        const watcher = await etcd.watch(key, (event) => {
            t.expect(event.key).toEqual(key);
            t.expect(event.value).toEqual(value);
            changed = true;
        });

        // 触发变化
        await etcd.put(key, value);

        // 等待事件触发
        await new Promise((resolve) => setTimeout(resolve, 100));
        t.expect(changed).toEqual(true);
        await watcher.cancel();
    });
});
