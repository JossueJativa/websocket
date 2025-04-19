import { OrderDetail } from '../model/order.control';
import { pool } from '../db';

describe('OrderDetail Controller', () => {
    beforeEach(async () => {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM order_details;');
            await client.query('ALTER SEQUENCE order_details_id_seq RESTART WITH 1;'); // Reset ID sequence
        } finally {
            client.release();
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should save a valid order', async () => {
        const order = new OrderDetail(1, 2, 3, null);
        await OrderDetail.save(order);
        const result = await pool.query('SELECT * FROM order_details WHERE product_id = $1;', [1]);
        expect(result.rows[0]).toMatchObject({
            product_id: 1,
            quantity: 2,
            desk_id: 3,
            garrison: null,
        });
    });

    test('should save a valid order with garrison as a list', async () => {
        const order = new OrderDetail(1, 2, 3, [1, 2]);
        await OrderDetail.save(order);
        const result = await pool.query('SELECT * FROM order_details WHERE product_id = $1;', [1]);
        expect(result.rows[0]).toMatchObject({
            product_id: 1,
            quantity: 2,
            desk_id: 3,
            garrison: '[1,2]',
        });
    });

    test('should throw an error when saving an invalid order', () => {
        expect(() => new OrderDetail(0, 0, 0, null)).toThrow('Invalid data');
    });

    test('should update an existing order', async () => {
        const order = new OrderDetail(1, 5, 3, null);
        await OrderDetail.save(order);
        await OrderDetail.update(order, 1);
        const result = await pool.query('SELECT * FROM order_details WHERE id = $1;', [1]);
        expect(result.rows[0]).toMatchObject({
            product_id: 1,
            quantity: 5,
            desk_id: 3,
            garrison: null,
        });
    });

    test('should delete an order by ID', async () => {
        const order = new OrderDetail(1, 2, 3, null);
        await OrderDetail.save(order);
        await OrderDetail.delete(1);
        const result = await pool.query('SELECT * FROM order_details WHERE id = $1;', [1]);
        expect(result.rows.length).toBe(0);
    });

    test('should delete all orders for a desk', async () => {
        const order1 = new OrderDetail(1, 2, 3, null);
        const order2 = new OrderDetail(2, 3, 3, null);
        await OrderDetail.save(order1);
        await OrderDetail.save(order2);
        const changes = await OrderDetail.deleteAll(3);
        expect(changes).toBe(2);
    });

    test('should get an order by ID', async () => {
        const order = new OrderDetail(1, 2, 3, null);
        await OrderDetail.save(order);

        const result = await OrderDetail.get(1);
        expect(result).toMatchObject({
            product_id: 1,
            quantity: 2,
            desk_id: 3,
            garrison: null,
        });
    });

    test('should get all orders for a desk', async () => {
        const order1 = new OrderDetail(1, 2, 3, null);
        const order2 = new OrderDetail(2, 3, 3, null);
        await OrderDetail.save(order1);
        await OrderDetail.save(order2);
        const result = await OrderDetail.getAll(3);
        expect(result).toMatchObject([
            { product_id: 1, quantity: 2, desk_id: 3, garrison: null },
            { product_id: 2, quantity: 3, desk_id: 3, garrison: null },
        ]);
    });

    test('should get all orders with garrison as a list', async () => {
        const order = new OrderDetail(1, 2, 3, [1, 2]);
        await OrderDetail.save(order);
        const result = await OrderDetail.getAll(3);
        expect(result).toMatchObject([
            { product_id: 1, quantity: 2, desk_id: 3, garrison: [1, 2] },
        ]);
    });

    afterAll(async () => {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM order_details;');
            await client.query('ALTER SEQUENCE order_details_id_seq RESTART WITH 1;'); // Reset ID sequence after all tests
        } finally {
            client.release();
        }
        await pool.end();
    });
});
