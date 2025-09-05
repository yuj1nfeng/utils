import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';
import z from 'zod';

export default async (model_dir, output_dir) => {
    const files = await fs.readdir(model_dir, { withFileTypes: true });
    const files_path = files.filter((p) => p.isFile && p.name.endsWith('.yml')).map((p) => path.join(p.parentPath, p.name));
    for (const file_path of files_path) {
        const content = await fs.readFile(file_path, { encoding: 'utf-8' });
        const { attributes } = yaml.parse(content);
        const list = [];
        for (const attr in attributes) {
            const [t, l] = attributes[attr].type.toUpperCase().split('(');

            const len = parseInt(l) || null;
            if (t == 'JSON' || t == 'JSONB') {
                let str = `${attr} : z.object()`;
                if (attributes[attr].allowNull) str += `.nullable(true)`;
                list.push(str);
                continue;
            }
            if (t == 'DATETIME' || t == 'TIMESTAMP') {
                let str = `${attr} : z.data()`;
                if (attributes[attr].allowNull) str += `.nullable(true)`;
                list.push(str);
                continue;
            }
            if (['VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT', 'MEDIUMTEXT'].includes(t)) {
                let str = `${attr} : z.string()`;
                if (len) str += `.max(${len})`;
                if (attributes[attr].allowNull) str += `.nullable(true)`;
                list.push(str);
                continue;
            }
            if (['SMALLINT', 'INT', 'BIGINT', 'TINYINT'].includes(t)) {
                let str = `${attr} : z.int()`;
                if (len) str += `.max(${2 ** len})`;
                if (attributes[attr].allowNull) str += `.nullable(true).default(0)`;
                list.push(str);
                continue;
            }
            if (t == 'DECIMAL' || t == 'NUMERIC') {
                let str = `${attr} : z.number()`;
                if (attributes[attr].allowNull) str += `.nullable(true).default(0)`;
                list.push(str);
                continue;
            }
            if (t == 'BOOLEAN') {
                let str = `${attr} : z.boolean()`;
                if (attributes[attr].allowNull) str += `.nullable(true).default(false)`;
                list.push(str);
                continue;
            }
        }
        const schema_name = path.basename(file_path, path.extname(file_path));
        if (list.length == 0) continue;
        let js_str = `import z from 'zod';\r\n`;
        js_str += `export default z.object({\r\n`;
        list.every((s) => (js_str += `\t${s},\r\n`));
        js_str += `})`;
        await fs.writeFile(path.join(output_dir, `${schema_name}.schema.js`), js_str);
    }
};
