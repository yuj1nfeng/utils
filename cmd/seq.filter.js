import { Op } from '@sequelize/core';

export default (values) => {
    const filter = {};
    for (let key in values) {
        const value = values[key];
        if (!value) continue;
        if (Array.isArray(value) && value.length > 0) {
            filter[key] = { [Op.in]: [...value] };
            continue;
        }
        if (typeof value === 'string') {
            filter[key] = { [Op.like]: value };
        }
    }
    return filter;
};
