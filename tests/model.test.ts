import { OrderHeader, OrderDetail } from '../model';
import { IDate, ITime } from '../interface';

describe('Model Tests', () => {
    test('OrderHeader model', () => {
        const date: IDate = { year: 2023, month: 10, day: 1 };
        const time: ITime = { hours: 12, minutes: 0, seconds: 0 };
        const orderHeader = new OrderHeader(1, time, date, 'PENDING');

        expect(orderHeader).toMatchObject({
            desk_id: 1,
            order_time: time,
            order_date: date,
            order_status: 'PENDING'
        });
    });

    test('OrderDetail model', () => {
        const orderDetail = new OrderDetail(1, 1, 2);

        expect(orderDetail).toMatchObject({
            order_header_id: 1,
            product_id: 1,
            quantity: 2
        });
    });
});
