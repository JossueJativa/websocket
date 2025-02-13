import { dbPromise } from '../db/database';
import { OrderHeader, OrderDetail } from '../model';
import { IDate, ITime } from '../interface';

describe('Database Tests', () => {
    beforeAll(async () => {
        const db = await dbPromise;
        await db.exec(`
            DELETE FROM order_details;
            DELETE FROM order_headers;
            DELETE FROM sqlite_sequence WHERE name='order_headers';
            DELETE FROM sqlite_sequence WHERE name='order_details';
        `);
    });

    test('Create and retrieve OrderHeader', async () => {
        const date: IDate = { year: 2025, month: 2, day: 13 };
        const time: ITime = { hours: 20, minutes: 0, seconds: 50 };
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
        const orderHeader = await OrderHeader.get(999);
        expect(orderHeader).toBeUndefined();
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
        const orderDetail = await OrderDetail.get(999);
        expect(orderDetail).toBeUndefined();
    });
});
