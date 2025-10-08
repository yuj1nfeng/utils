import { Sequelize } from '@sequelize/core';
import fs from 'node:fs/promises';
import YAML from 'yaml';

// if (!process.env['SEQUELIZE_URL']) throw new Error('environment variable SEQUELIZE_URL is not set');
// if (!process.env['SEQUELIZE_DIALECT']) throw new Error('environment variable SEQUELIZE_DIALECT is not set');
const logging = (sql, timing) => {
    const colors = { title: `\x1b[32m`, timing: `\x1b[36m`, sql: `\x1b[90m`, reset: `\x1b[0m` };
    sql = sql.replace('Executing (default): ', '');
    Bun.write(Bun.stdout, `${colors.title}[${new Date().toLocaleString()}] SQL 👇👇👇👇👇👇\n${colors.reset}`);
    Bun.write(Bun.stdout, `${colors.sql}👉  ${sql}  👈\n${colors.reset}`);
    process.env['DEBUG'] && Bun.write(Bun.stdout, `${colors.timing}${JSON.stringify(timing)}\n${colors.reset}`);
};
const sequelize = new Sequelize({
    url: process.env['SEQUELIZE_URL'],
    dialect: process.env['SEQUELIZE_DIALECT'],
    logging: logging,
    hooks: {
        beforeConnect: (e) => {
            e.host = e.host.replace(/\[|\]/g, '');
        },
    },
});
export default sequelize;
