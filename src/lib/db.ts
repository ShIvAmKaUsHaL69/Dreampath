import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dreampath',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export default pool;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows as unknown as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryOne<T = RowDataPacket>(sql: string, params?: any[]): Promise<T | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows.length > 0 ? (rows[0] as unknown as T) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insert(sql: string, params?: any[]): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result.insertId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function update(sql: string, params?: any[]): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result.affectedRows;
}
