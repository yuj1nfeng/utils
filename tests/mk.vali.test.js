import * as t from 'bun:test';
import utils from '#utils';
import fs from 'node:fs/promises';
import path from 'node:path';
import validator from 'validator';

t.describe('mk 功能测试', () => {
    t.it('mock 函数生成模拟数据', () => {
        const template = {
            'name|1-10': '★',
            'age|18-60': 1,
            'email': '@email',
            'website': '@url',
        };

        const result = utils.mk.mock(template);

        t.expect(result).toHaveProperty('name');
        t.expect(result).toHaveProperty('age');
        t.expect(result).toHaveProperty('email');
        t.expect(result).toHaveProperty('website');
        t.expect(typeof result.name).toBe('string');
        t.expect(typeof result.age).toBe('number');
        t.expect(result.age).toBeGreaterThanOrEqual(18);
        t.expect(result.age).toBeLessThanOrEqual(60);
    });

    t.it('random 方法生成各种类型数据', () => {
        t.expect(validator.isEmail(utils.mk.random.email())).toBe(true);
        t.expect(validator.isURL(utils.mk.random.url('http'))).toBe(true);
        t.expect(validator.isURL(utils.mk.random.url('https'))).toBe(true);
        t.expect(validator.isURL(utils.mk.random.url('ftp'))).toBe(true);
        t.expect(validator.isIP(utils.mk.random.ip())).toBe(true);

        const name = utils.mk.random.name();
        t.expect(typeof name).toBe('string');
        t.expect(name.length).toBeGreaterThan(0);

        const integer = utils.mk.random.integer(1, 100);
        t.expect(typeof integer).toBe('number');
        t.expect(integer).toBeGreaterThanOrEqual(1);
        t.expect(integer).toBeLessThanOrEqual(100);
    });
});

t.describe('vali 验证功能测试', () => {
    t.it('邮箱验证', () => {
        t.expect(validator.isEmail('test@example.com')).toBe(true);
        t.expect(validator.isEmail('invalid-email')).toBe(false);
        t.expect(validator.isEmail('')).toBe(false);
        t.expect(() => validator.isEmail(null)).toThrow('Expected a string but received a null');
        t.expect(() => validator.isEmail(123)).toThrow('Expected a string but received a Number');
    });

    t.it('URL 验证', () => {
        t.expect(validator.isURL('https://example.com')).toBe(true);
        t.expect(validator.isURL('http://localhost:3000')).toBe(false);
        t.expect(validator.isURL('ftp://ftp.example.com')).toBe(true);
        t.expect(validator.isURL('invalid-url')).toBe(false);
    });

    t.it('IP 地址验证', () => {
        t.expect(validator.isIP('192.168.1.1')).toBe(true);
        t.expect(validator.isIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
        t.expect(validator.isIP('invalid-ip')).toBe(false);
    });

    t.it('端口号验证', () => {
        t.expect(validator.isPort('8080')).toBe(true);
        t.expect(validator.isPort('65535')).toBe(true);
        t.expect(validator.isPort('0')).toBe(true);
        t.expect(validator.isPort('65536')).toBe(false);
    });

    t.it('UUID 验证', () => {
        t.expect(validator.isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        t.expect(validator.isUUID('invalid-uuid')).toBe(false);
    });

    t.it('JSON 验证', () => {
        t.expect(validator.isJSON('{"name": "John"}')).toBe(true);
        t.expect(validator.isJSON('invalid-json')).toBe(false);
    });

    t.it('手机号验证', () => {
        t.expect(validator.isMobilePhone('13800138000', 'zh-CN')).toBe(true);
        t.expect(validator.isMobilePhone('+8613800138000', 'zh-CN')).toBe(true);
        t.expect(validator.isMobilePhone('invalid-phone', 'zh-CN')).toBe(false);
    });

    t.it('日期验证', () => {
        t.expect(validator.isDate('2023-12-25')).toBe(true);
        t.expect(validator.isDate('invalid-date')).toBe(false);
        t.expect(validator.isISO8601('2023-12-25T10:30:00Z')).toBe(true);
    });

    t.it('数字范围验证', () => {
        t.expect(validator.isInt('42')).toBe(true);
        t.expect(validator.isInt('3.14')).toBe(false);
        t.expect(validator.isFloat('3.14')).toBe(true);
    });

    t.it('密码强度验证', () => {
        t.expect(validator.isStrongPassword('StrongPass123!')).toBe(true);
        t.expect(validator.isStrongPassword('weak')).toBe(false);
    });
});

t.describe('yaml 验证器集成测试', () => {
    const testRulesPath = path.join(__dirname, 'test-rules.yml');

    t.beforeAll(async () => {
        // 创建测试用的 YAML 规则文件
        const rulesContent = `
name:
  type: string
  required: true
  minLength: 2
  maxLength: 50

age:
  type: number
  required: true

email:
  type: string
  format: email
  required: true

website:
  type: string
  format: url
  required: false
`;
        await fs.writeFile(testRulesPath, rulesContent);
    });

    t.afterAll(async () => {
        // 清理测试文件
        try {
            await fs.unlink(testRulesPath);
        } catch (error) {
            // 文件可能不存在，忽略错误
        }
    });
});

t.describe('mk 和 vali 集成测试', () => {
    t.it('mock 生成的数据通过 validator 验证', () => {
        const template = {
            'name': '@name',
            'email': '@email',
            'age|18-60': 1,
            'website': '@url("https")',
            'ip': '@ip',
            'uuid': '@uuid',
        };

        const mockData = utils.mk.mock(template);

        // 验证生成的数据格式
        t.expect(validator.isEmail(mockData.email)).toBe(true);
        t.expect(validator.isURL(mockData.website)).toBe(true);
        t.expect(validator.isIP(mockData.ip)).toBe(true);
        t.expect(typeof mockData.name).toBe('string');
        t.expect(typeof mockData.age).toBe('number');
        t.expect(mockData.age).toBeGreaterThanOrEqual(18);
        t.expect(mockData.age).toBeLessThanOrEqual(60);
    });

    t.it('随机生成的数据通过相应验证', () => {
        // 测试各种随机生成器
        t.expect(validator.isEmail(utils.mk.random.email())).toBe(true);
        t.expect(validator.isURL(utils.mk.random.url('https'))).toBe(true);
        t.expect(validator.isIP(utils.mk.random.ip())).toBe(true);
        // t.expect(validator.isUUID(utils.mk.random.uuid())).toBe(true);

        const name = utils.mk.random.name();
        t.expect(typeof name).toBe('string');
        t.expect(name.length).toBeGreaterThan(0);

        const integer = utils.mk.random.integer(1, 100);
        t.expect(validator.isInt(integer.toString())).toBe(true);
        t.expect(integer).toBeGreaterThanOrEqual(1);
        t.expect(integer).toBeLessThanOrEqual(100);
    });
});
