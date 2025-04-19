import { pool } from './database';

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