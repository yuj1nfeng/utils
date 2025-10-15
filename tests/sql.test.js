import * as t from 'bun:test';
import utils from '../index.js';
const sql = utils.sql;

// 模拟生成用户数据
const mockUser = () => ({
  id: utils.mk.random.uuid(), // 生成唯一 ID
  name: utils.mk.random.cname(), // 模拟中文姓名
  email: utils.mk.random.email(), // 模拟邮箱地址
});

// 定义 SQL 测试套件
t.describe('SQL', async () => {
  // 测试数据：表名
  const test_table = 'users';

  const create_table_sql = `create table if not exists ${test_table} (
        id text primary key,
        name text,
        email text
    );`;
  const drop_table_sql = `drop table if exists ${test_table} ;`;

  t.beforeAll(async () => {
    await sql.unsafe(drop_table_sql);
    await sql.unsafe(create_table_sql);
  });
  t.afterAll(async () => {
    //await sql.unsafe(drop_table_sql);
  });

  // 测试插入单条数据
  t.it('Insert', async () => {
    const user_data = mockUser(); // 生成模拟用户数据
    // 执行插入操作并返回结果
    const [result] = await sql`insert into ${sql(test_table)} ${sql(user_data)} returning * ;`;
    // 验证插入的数据是否正确
    t.expect(result.name).toEqual(user_data.name);
    t.expect(result.email).toEqual(user_data.email);
    t.expect(result.id).toEqual(user_data.id);
  });

  // 测试插入指定列的数据
  t.it('Insert Picking Columns ', async () => {
    const user_data = mockUser(); // 生成模拟用户数据
    const insert_columns = ['id', 'name']; // 指定插入的列
    // 执行插入操作并返回结果
    const [result] = await sql`insert into ${sql(test_table)} ${sql(user_data, ...insert_columns)}  returning * ;`;
    // 验证插入的数据是否正确
    t.expect(result.id).toEqual(user_data.id);
    t.expect(result.name).toEqual(user_data.name);
    t.expect(result.email).toBeNull(); // 验证未插入的列为空
  });

  // // 测试批量插入数据
  t.it('Bulk Insert', async () => {
    const total = 5; // 定义插入的数据量
    // 生成多组模拟用户数据
    const users = Array(total)
      .fill()
      .map(() => mockUser());

    // 执行批量插入操作并返回结果
    const result = await sql`insert into ${sql(test_table)} ${sql(users)} returning * ;`;
    // 验证插入的数据量是否正确
    t.expect(result.length).toEqual(total);
  });

  // 测试删除数据
  t.it('Delete', async () => {
    const [count_result] = await sql`select count(1) from ${sql('users')};`;
    const delete_result = await sql`delete from ${sql(test_table)} ;`;
    t.expect(count_result.count).toEqual(delete_result.count.toString());
  });

  // 测试查询数据
  t.it('Select', async () => {
    // 执行查询操作
    const rows = await sql`select * from ${sql(test_table)}`.values();
    // 验证返回结果是否为数组
    t.expect(Array.isArray(rows)).toBeTruthy();
  });

  // 测试不安全查询（直接拼接 SQL 语句）
  t.it('Unsafe', async () => {
    const user_data = mockUser(); // 生成模拟用户数据
    // 执行插入操作
    await sql`insert into ${sql(test_table)} ${sql(user_data)}  returning * ;`;
    // 执行不安全查询（直接拼接 SQL 语句）
    const [result] = await sql.unsafe(`select * from ${test_table} where id = $1 ;`, [user_data.id]);
    // 验证查询结果是否正确
    t.expect(result.email).toEqual(user_data.email);
    t.expect(result.id).toEqual(user_data.id);
  });
});
