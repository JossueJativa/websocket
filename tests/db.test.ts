import { dbPromise } from '../db/database';
import { OrderDetail } from '../model';

describe('Database Tests', () => {
    beforeAll(async () => {
        const db = await dbPromise;
        await db.exec(`
            DELETE FROM order_details;
            DELETE FROM sqlite_sequence WHERE name='order_details';
        `);
    });

    test('Create and retrieve OrderDetail', async () => {
        const orderDetail = new OrderDetail(1, 1, 2, null);
        await OrderDetail.save(orderDetail);

        const savedOrderDetail = await OrderDetail.get(1);
        expect(savedOrderDetail).toMatchObject({
            product_id: 1,
            quantity: 1,
            desk_id: 2,
            garrison: null,
        });
    });

    test('should fail to retrieve non-existent OrderDetail', async () => {
        const orderDetail = await OrderDetail.get(999);
        expect(orderDetail).toBeUndefined();
    });
});
