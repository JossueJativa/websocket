import { pool } from '../db/database';

class OrderDetail {
    constructor(
        public product_id: number,
        public quantity: number,
        public desk_id: number,
        public garrison: number[] | null
    ) {}

    static async save(orderDetail: OrderDetail): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query(
                'INSERT INTO order_details (product_id, quantity, desk_id, garrison) VALUES ($1, $2, $3, $4)',
                [
                    orderDetail.product_id,
                    orderDetail.quantity,
                    orderDetail.desk_id,
                    orderDetail.garrison ? JSON.stringify(orderDetail.garrison) : null
                ]
            );
        } finally {
            client.release();
        }
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

    static async get(id: number): Promise<OrderDetail | undefined> {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM order_details WHERE id = $1', [id]);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return new OrderDetail(
                    row.product_id,
                    row.quantity,
                    row.desk_id,
                    row.garrison ? JSON.parse(row.garrison) : null
                );
            }
            return undefined;
        } finally {
            client.release();
        }
    }

    static async getAll(desk_id: number): Promise<OrderDetail[]> {
        const result = await pool.query('SELECT * FROM order_details WHERE desk_id = $1', [desk_id]);
        return result.rows.map((row) =>
            new OrderDetail(
                row.product_id,
                row.quantity,
                row.desk_id,
                row.garrison ? JSON.parse(row.garrison) : null
            )
        );
    }
}

export { OrderDetail };