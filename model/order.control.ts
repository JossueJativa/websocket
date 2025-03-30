import { dbPromise } from '../db';

class OrderDetail {
    product_id: number;
    quantity: number;
    desk_id: number;

    constructor(product_id: number, quantity: number, desk_id: number) {
        if (!product_id || !quantity || !desk_id) {
            throw new Error('Invalid data');
        }
        this.product_id = product_id;
        this.quantity = quantity;
        this.desk_id = desk_id;
    }

    static async save(order: OrderDetail) {
        const db = await dbPromise;
        await db.run(
            `INSERT INTO order_details (product_id, quantity, desk_id) VALUES (?, ?, ?)`,
            order.product_id,
            order.quantity,
            order.desk_id
        );
    }

    static async update(order: OrderDetail, order_id: number) {
        const db = await dbPromise;
        await db.run(
            `UPDATE order_details SET product_id = ?, quantity = ? WHERE id = ?`,
            order.product_id,
            order.quantity,
            order_id
        );
    }

    static async delete(order_id: number) {
        const db = await dbPromise;
        await db.run(`DELETE FROM order_details WHERE id = ?`, order_id);
    }

    static async deleteAll(desk_id: number): Promise<number> {
        const db = await dbPromise;
        const result = await db.run(`DELETE FROM order_details WHERE desk_id = ?`, desk_id);
        return result.changes ?? 0; // Return the number of rows affected
    }

    static async get(order_details_id: number) {
        const db = await dbPromise;
        const order = await db.get(`SELECT * FROM order_details WHERE id = ?`, order_details_id);
        return order;
    }

    static async getAll(desk_id: number) {
        const db = await dbPromise;
        const orders = await db.all(`SELECT * FROM order_details WHERE desk_id = ?`, [desk_id]);
        return orders;
    }
}

export { OrderDetail };