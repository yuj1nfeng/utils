import fs from 'node:fs/promises';
import path from 'node:path';
import { Sequelize } from '@sequelize/core';
import YAML from 'yaml';
/**
 * 从数据库读取表结构并生成 YAML 文件
 * @param {Object} options - 配置选项
 * @param {string} options.outputDir - 输出目录路径
 * @param {string} [options.databaseUrl] - 数据库连接UR
 * @param {string} [options.dialect] - 数据库方言
 * @param {string[]} [options.excludeTables] - 要排除的表名数组
 * @returns {Promise<void>}
 * @throws {Error} 如果数据库连接失败或读取表结构失败
 */
export default async function (options) {
    const { outputDir, databaseUrl, dialect, excludeTables = [] } = options;
    await fs.mkdir(outputDir, { recursive: true });
    const logging = (sql, _) => console.log(sql.replace('Executing (default):', '📈📈📈 '));
    const sequelize = new Sequelize({ url: databaseUrl, dialect: dialect, logging: logging });
    await sequelize.authenticate();
    const query = sequelize.getQueryInterface();
    const all_tables = await query.listTables();
    // 过滤排除的表
    const tables = all_tables.filter((t) => !excludeTables.includes(t));
    for (const table of tables) {
        const table_schema = await query.describeTable(table.tableName);
        const indexes = await query.showIndex(table.tableName);
        const [result] = await sequelize.query(`SELECT obj_description('${table.schema}."${table.tableName}"'::regclass, 'pg_class') as comment;`, { type: sequelize.QueryTypes.SELECT });
        const data = {
            model_name: table.tableName,
            comment: result ? result.comment : '',
            options: { modelName: table.tableName, tableName: table.tableName, comment: ``, createdAt: false, updatedAt: false, indexes: indexes },

            attributes: {},
        };
        for (const [column_name, column_info] of Object.entries(table_schema)) {
            data.attributes[column_name] = { ...column_info };
        }
        const output_file = path.join(outputDir, `${table.tableName}.yml`);
        await fs.writeFile(output_file, YAML.stringify(data), 'utf8');
        console.log(`Generated schema for table: ${table.tableName}`);
    };
    console.log('Schema generation completed.');
    await sequelize.close(); // 关闭数据库连接
}
