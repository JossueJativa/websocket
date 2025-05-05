import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.POSTGRES_USER ?? 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    database: process.env.POSTGRES_DB ?? 'admincontroller',
    password: process.env.POSTGRES_PASSWORD ?? 'admincontroller',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_details (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                desk_id INTEGER NOT NULL,
                garrison TEXT DEFAULT NULL
            );
        `);
    } finally {
        client.release();
    }
})();

export { pool };