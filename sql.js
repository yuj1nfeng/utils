import { SQL } from 'bun';

const sql = new SQL(process.env['POSTGRES_URL']);

/**
 * Generates a CREATE TABLE SQL statement based on a schema object.
 * @param {string} tableName - The name of the table.
 * @param {Object} schema - The schema definition (e.g., { id: 'SERIAL PRIMARY KEY', name: 'VARCHAR(255) NOT NULL' }).
 * @returns {string} The generated CREATE TABLE SQL statement.
 */
export const generateCreateTableSql = (tableName, schema) => {
  const columns = Object.entries(schema)
    .map(([columnName, definition]) => `${columnName} ${definition}`)
    .join(', ');
  return `CREATE TABLE ${tableName} (${columns});`;
};

/**
 * Generates an ALTER TABLE SQL statement to add a column.
 * @param {string} tableName - The name of the table.
 * @param {string} columnName - The name of the column to add.
 * @param {string} definition - The column definition (e.g., 'VARCHAR(255) NOT NULL').
 * @returns {string} The generated ALTER TABLE SQL statement.
 */
export const generateAddColumnSql = (tableName, columnName, definition) => {
  return `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`;
};

/**
 * Generates an ALTER TABLE SQL statement to modify a column.
 * @param {string} tableName - The name of the table.
 * @param {string} columnName - The name of the column to modify.
 * @param {string} newDefinition - The new column definition (e.g., 'VARCHAR(255) NOT NULL').
 * @returns {string} The generated ALTER TABLE SQL statement.
 */
export const generateModifyColumnSql = (tableName, columnName, newDefinition) => {
  return `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} TYPE ${newDefinition};`;
};

export default sql;
