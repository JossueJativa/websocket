import { pool } from '../db';

class OrderDetail {
    product_id: number;
    quantity: number;
    desk_id: number;
    garrison: number[] | null;

    constructor(product_id: number, quantity: number, desk_id: number, garrison: number[] | null) {
        if (!product_id || !quantity || !desk_id) {
            throw new Error('Invalid data');
        }
        this.product_id = product_id;
        this.quantity = quantity;
        this.desk_id = desk_id;
        this.garrison = garrison;
    }

    static async save(order: OrderDetail) {
        await pool.query(
            `INSERT INTO order_details (product_id, quantity, desk_id, garrison) VALUES ($1, $2, $3, $4)`,
            [
                order.product_id,
                order.quantity,
                order.desk_id,
                order.garrison ? JSON.stringify(order.garrison) : null
            ]
        );
    }

    static async update(order: OrderDetail, order_id: number) {
        await pool.query(
            `UPDATE order_details SET product_id = $1, quantity = $2 WHERE id = $3`,
            [order.product_id, order.quantity, order_id]
        );
    }

    static async delete(order_id: number) {
        await pool.query(`DELETE FROM order_details WHERE id = $1`, [order_id]);
    }

    static async deleteAll(desk_id: number): Promise<number> {
        const result = await pool.query(`DELETE FROM order_details WHERE desk_id = $1`, [desk_id]);
        return result.rowCount ?? 0;
    }

    static async get(order_details_id: number) {
        const result = await pool.query(`SELECT * FROM order_details WHERE id = $1`, [order_details_id]);
        const order = result.rows[0];
        if (order?.garrison) {
            order.garrison = JSON.parse(order.garrison);
        }
        return order;
    }

    static async getAll(desk_id: number) {
        const result = await pool.query(`SELECT * FROM order_details WHERE desk_id = $1`, [desk_id]);
        return result.rows.map((order: any) => ({
            ...order,
            garrison: order.garrison ? JSON.parse(order.garrison) : null
        }));
    }
}

export { OrderDetail };