import { Sequelize } from '@sequelize/core';
import fs from 'node:fs/promises';
import YAML from 'yaml';

if (!process.env['SEQUELIZE_URL']) throw new Error('environment variable SEQUELIZE_URL is not set');
if (!process.env['SEQUELIZE_DIALECT']) throw new Error('environment variable SEQUELIZE_DIALECT is not set');
const models_dir = process.env['SEQUELIZE_SCHEMA_DIR'] || '.sequelize';

const logging = (sql, timing) => {
    const colors = { title: `\x1b[32m`, timing: `\x1b[36m`, sql: `\x1b[31m`, reset: `\x1b[0m` };
    sql = sql.replace('Executing (default): ', '');
    Bun.write(Bun.stdout, `${colors.title}[${new Date().toLocaleString()}] SQL 👇👇👇👇👇👇\n${colors.reset}`);
    Bun.write(Bun.stdout, `${colors.sql}👉  ${sql}  👈\n${colors.reset}`);
    process.env['DEBUG'] && Bun.write(Bun.stdout, `${colors.timing}${JSON.stringify(timing)}\n${colors.reset}`);
};
const sequelize = new Sequelize({
    url: process.env['SEQUELIZE_URL'],
    dialect: process.env['SEQUELIZE_DIALECT'],
    logging: logging,
});

const defineModels = async () => {
    const files = (await fs.readdir(models_dir)).filter((file) => file.endsWith('.yml'));
    for (const file_name of files) {
        const str = await fs.readFile(`${models_dir}/${file_name}`, { encoding: 'utf-8' });
        const { model_name, attributes, options } = YAML.parse(str);
        sequelize.define(model_name, attributes, options);
        console.log(`\x1b[96m load data model: ${model_name} ✔ \x1b[0m`);
    }
};
await defineModels();

export default sequelize;
