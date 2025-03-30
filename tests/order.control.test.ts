import { OrderDetail } from '../model/order.control';
import { dbPromise } from '../db';

jest.mock('../db', () => ({
    dbPromise: Promise.resolve({
        run: jest.fn(),
        get: jest.fn(),
    }),
}));

describe('OrderDetail Controller', () => {
    let dbMock: any;

    beforeAll(async () => {
        dbMock = await dbPromise;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should save a valid order', async () => {
        const order = new OrderDetail(1, 2, 3);
        await OrderDetail.save(order);
        expect(dbMock.run).toHaveBeenCalledWith(
            `INSERT INTO order_details (product_id, quantity, desk_id) VALUES (?, ?, ?)`,
            1, 2, 3
        );
    });

    test('should throw an error when saving an invalid order', () => {
        expect(() => new OrderDetail(0, 0, 0)).toThrow('Invalid data');
    });

    test('should update an existing order', async () => {
        const order = new OrderDetail(1, 5, 3);
        await OrderDetail.update(order, 10);
        expect(dbMock.run).toHaveBeenCalledWith(
            `UPDATE order_details SET product_id = ?, quantity = ? WHERE id = ?`,
            1, 5, 10
        );
    });

    test('should delete an order by ID', async () => {
        await OrderDetail.delete(10);
        expect(dbMock.run).toHaveBeenCalledWith(
            `DELETE FROM order_details WHERE id = ?`,
            10
        );
    });

    test('should delete all orders for a desk', async () => {
        dbMock.run.mockResolvedValue({ changes: 3 });
        const changes = await OrderDetail.deleteAll(3);
        expect(dbMock.run).toHaveBeenCalledWith(
            `DELETE FROM order_details WHERE desk_id = ?`,
            3
        );
        expect(changes).toBe(3);
    });

    test('should get an order by ID', async () => {
        dbMock.get.mockResolvedValue({ id: 10, product_id: 1, quantity: 2, desk_id: 3 });
        const order = await OrderDetail.get(10);
        expect(dbMock.get).toHaveBeenCalledWith(
            `SELECT * FROM order_details WHERE id = ?`,
            10
        );
        expect(order).toEqual({ id: 10, product_id: 1, quantity: 2, desk_id: 3 });
    });

    test('should get all orders for a desk', async () => {
        dbMock.get.mockResolvedValue([{ id: 1, product_id: 1, quantity: 2, desk_id: 3 }]);
        const orders = await OrderDetail.getAll(3);
        expect(dbMock.get).toHaveBeenCalledWith(
            `SELECT * FROM order_details WHERE desk_id = ?`,
            3
        );
        expect(orders).toEqual([{ id: 1, product_id: 1, quantity: 2, desk_id: 3 }]);
    });
});
