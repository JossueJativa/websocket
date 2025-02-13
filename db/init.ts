import { dbPromise } from './database';

(async () => {
    const db = await dbPromise;
    await db.exec(`
        CREATE TABLE IF NOT EXISTS order_headers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            desk_id INTEGER NOT NULL,
            order_time TEXT NOT NULL,
            order_date TEXT NOT NULL,
            order_status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS order_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_header_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY(order_header_id) REFERENCES order_headers(id)
        );
    `);
    console.log('Database initialized');
})();