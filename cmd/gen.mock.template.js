import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';


export default async (model_dir, output_dir) => {
    const files = await fs.readdir(model_dir, { withFileTypes: true });
    await fs.mkdir(output_dir, { recursive: true });
    const files_path = files.filter((p) => p.isFile && p.name.endsWith('.yml')).map((p) => path.join(p.parentPath, p.name));
    for (const file_path of files_path) {
        const content = await fs.readFile(file_path, { encoding: 'utf-8' });
        const { attributes } = yaml.parse(content);
        const schema = {};
        for (const attr in attributes) {
            if (attr === 'id') continue;



            const [t, l] = attributes[attr].type.toUpperCase().split('(');
            const max_len = parseInt(l) || null;
            // 特殊属性处理

            if (t === 'JSON' || t === 'JSONB') {
                schema[`${attr}|1`] = { "test1": "test1", "test2": "test2" };
                continue;
            }

            if (attr.endsWith('date')) {
                schema[attr] = `@date`;
                continue;
            }

            if (attr.includes('version')) {
                schema[attr] = `@string("number",2).@string("number",2).@string("number",3)`;
                continue;
            }

            if (attr.includes('image')) {
                schema[attr] = `@url("https").@pick(png,jpg,svg)`;
                continue;
            }
            if (attr.includes('video')) {
                schema[attr] = `@url("https").@pick(mp4,mov,avi)`;
                continue;
            }

            const comment = attributes[attr].comment;
            if (comment && comment.includes('/')) {
                const result = JSON.stringify(comment.split(' ').pop().split('/'));
                schema[attr] = `@pick(${result})`;
                continue;
            }
            const validate = attributes[attr].validate;
            if (validate && validate.min && validate.max) {
                const { min, max } = validate;
                schema[attr] = `@integer(${min},${max})`;
                continue;
            }

            if (attr === 'id' || attr.endsWith('_id')) {
                schema[attr] = `@uuid`;
                continue;
            }
            if (attr === 'name') {
                schema[attr] = `@ctitle(3, 10)`;
                continue;
            }
            if (attr.endsWith('email')) {
                schema[attr] = `@email`;
                continue;
            }
            if (attr.endsWith('number') || attr.endsWith('_no')) {
                schema[attr] = max_len ? `@string("number", ${max_len})` : `@string("number")`;
                continue;
            }
            if (attr.endsWith('ip') || attr.endsWith('ip_address')) {
                schema[attr] = `@ip`;
                continue;
            }

            // 标准类型处理
            if (typeMappings[t]) {
                schema[attr] = typeMappings[t](max_len);
                continue;
            }
            // 默认处理
            schema[attr] = `@unknown`;
        }
        const schema_name = path.basename(file_path, path.extname(file_path));
        await fs.writeFile(path.join(output_dir, `${schema_name}.yml`), yaml.stringify(schema), { encoding: 'utf-8' });
    }
};



const typeMappings = {
    VARCHAR: (max_len) => max_len ? `@string("lower",${max_len})` : `@string("lower",255)`,
    CHAR: (max_len) => max_len ? `@string("lower",${max_len})` : `@string("lower",1)`,
    TEXT: () => `@paragraph(1, 3)`,
    LONGTEXT: () => `@paragraph(3, 7)`,
    MEDIUMTEXT: () => `@paragraph(2, 5)`,
    SMALLINT: () => '@integer(0, 32767)',
    INT: () => '@integer(0, 2147483647)',
    BIGINT: () => '@integer(0, 9007199254740991)',
    TINYINT: () => '@integer(0, 255)',
    DECIMAL: () => '@float(0, 100, 2, 6)',
    NUMERIC: () => '@float(0, 100, 2, 6)',
    BOOLEAN: () => '@boolean',
    TIMESTAMP: () => '@datetime',
};