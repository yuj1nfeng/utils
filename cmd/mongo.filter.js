/**
 * 构建查询过滤器
 * @param {Object} values - 查询条件键值对
 * @returns {Object} 构建后的查询过滤器
 */
export default (values) => {
    const filter = {};
    for (let key in values) {
        const value = values[key];
        if (!value) continue;
        if (Array.isArray(value) && value.length > 0) {
            filter[key] = { $in: [...value] };
            continue;
        }
        if (typeof value === 'string') {
            filter[key] = { $regex: value };
        }
    }
    return filter;
};
