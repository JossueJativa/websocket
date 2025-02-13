import { dbPromise } from '../db/database';
import { OrderHeader, OrderDetail } from '../model';
import { IDate, ITime } from '../interface';

describe('Database Tests', () => {
    beforeAll(async () => {
        const db = await dbPromise;
        await db.exec(`
            DELETE FROM order_details;
            DELETE FROM order_headers;
            INSERT INTO order_headers (desk_id, order_time, order_date, order_status) VALUES (1, '{"hours":12,"minutes":0,"seconds":0}', '{"year":2023,"month":10,"day":1}', 'PENDING');
            INSERT INTO order_details (order_header_id, product_id, quantity) VALUES (1, 1, 2);
        `);
    });

    test('Create and retrieve OrderHeader', async () => {
        const date: IDate = { year: 2023, month: 10, day: 1 };
        const time: ITime = { hours: 12, minutes: 0, seconds: 0 };
        const orderHeader = new OrderHeader(1, time, date, 'PENDING');
        await OrderHeader.save(orderHeader);

        const savedOrderHeader = await OrderHeader.get(1);
        expect(savedOrderHeader).toMatchObject({
            desk_id: 1,
            order_time: JSON.stringify(time),
            order_date: JSON.stringify(date),
            order_status: 'PENDING'
        });
    });

    test('should fail to retrieve non-existent OrderHeader', async () => {
        await expect(OrderHeader.get(999)).rejects.toThrow('OrderHeader not found for ID: 999');
    });

    test('Create and retrieve OrderDetail', async () => {
        const orderDetail = new OrderDetail(1, 1, 2);
        await OrderDetail.save(orderDetail);

        const savedOrderDetail = await OrderDetail.get(1);
        expect(savedOrderDetail).toMatchObject({
            order_header_id: 1,
            product_id: 1,
            quantity: 2
        });
    });

    test('should fail to retrieve non-existent OrderDetail', async () => {
        await expect(OrderDetail.get(999)).rejects.toThrow('OrderDetail not found for ID: 999');
    });
});
