import { ITime, IDate } from '../interface';
import { dbPromise } from '../db';

class OrderHeader {
    desk_id: number;
    order_time: ITime;
    order_date: IDate;
    order_status: string;

    constructor(desk_id: number, order_time: ITime, order_date: IDate, order_status: string) {
        if (!desk_id || !order_time || !order_date || !order_status) {
            throw new Error('Invalid data');
        }
        this.desk_id = desk_id;
        this.order_time = order_time;
        this.order_date = order_date;
        this.order_status = order_status;
    }

    static async save(order: OrderHeader) {
        const db = await dbPromise;
        await db.run(
            `INSERT INTO order_headers (desk_id, order_time, order_date, order_status) VALUES (?, ?, ?, ?)`,
            order.desk_id,
            JSON.stringify(order.order_time),
            JSON.stringify(order.order_date),
            order.order_status
        );
        console.log('OrderHeader saved:', order);
    }

    static async update(order: OrderHeader, order_id: number) {
        const db = await dbPromise;
        await db.run(
            `UPDATE order_headers SET desk_id = ?, order_time = ?, order_date = ?, order_status = ? WHERE id = ?`,
            order.desk_id,
            JSON.stringify(order.order_time),
            JSON.stringify(order.order_date),
            order.order_status,
            order_id
        );
        console.log('OrderHeader updated:', order);
    }

    static async delete(order_id: number) {
        const db = await dbPromise;
        await db.run(`DELETE FROM order_headers WHERE id = ?`, order_id);
    }

    static async get(order_id: number) {
        const db = await dbPromise;
        const order = await db.get(`SELECT * FROM order_headers WHERE id = ?`, order_id);
        console.log('OrderHeader retrieved:', order, 'for ID:', order_id);
        return order;
    }
}

class OrderDetail {
    order_header_id: number;
    product_id: number;
    quantity: number;

    constructor(order_header_id: number, product_id: number, quantity: number) {
        if (!order_header_id || !product_id || !quantity) {
            throw new Error('Invalid data');
        }
        this.order_header_id = order_header_id;
        this.product_id = product_id;
        this.quantity = quantity;
    }

    static async save(order: OrderDetail) {
        const db = await dbPromise;
        await db.run(
            `INSERT INTO order_details (order_header_id, product_id, quantity) VALUES (?, ?, ?)`,
            order.order_header_id,
            order.product_id,
            order.quantity
        );
        console.log('OrderDetail saved:', order);
    }

    static async update(order: OrderDetail, order_id: number) {
        const db = await dbPromise;
        await db.run(
            `UPDATE order_details SET product_id = ?, quantity = ? WHERE id = ?`,
            order.product_id,
            order.quantity,
            order_id
        );
        console.log('OrderDetail updated:', order);
    }

    static async delete(order_id: number) {
        const db = await dbPromise;
        await db.run(`DELETE FROM order_details WHERE id = ?`, order_id);
    }

    static async get(order_id: number) {
        const db = await dbPromise;
        const order = await db.get(`SELECT * FROM order_details WHERE id = ?`, order_id);
        console.log('OrderDetail retrieved:', order, 'for ID:', order_id);
        return order;
    }

    static async getOrdersByOrderHeaderId(order_header_id: number) {
        const db = await dbPromise;
        const orders = await db.all(`SELECT * FROM order_details WHERE order_header_id = ?`, order_header_id);
        console.log('OrderDetails retrieved:', orders, 'for OrderHeader ID:', order_header_id);
        return orders;
    }
}

export { OrderHeader, OrderDetail };