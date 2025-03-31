import { OrderDetail } from '../model';

describe('Model Tests', () => {

    test('OrderDetail model', () => {
        const orderDetail = new OrderDetail(1, 1, 2, null);

        expect(orderDetail).toMatchObject({
            product_id: 1,
            quantity: 1,
            desk_id: 2,
            garrison: null,
        });
    });

    test('should create OrderDetail with array of Garrison', () => {
        const orderDetail = new OrderDetail(1, 1, 2, [1, 2]);

        expect(orderDetail).toMatchObject({
            product_id: 1,
            quantity: 1,
            desk_id: 2,
            garrison: [1, 2],
        });
    });

    test('should fail to create OrderDetail with invalid data', () => {
        expect(() => new OrderDetail(null as any, null as any, null as any, null as any)).toThrowError('Invalid data');
    });
});
