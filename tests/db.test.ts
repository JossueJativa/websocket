import { pool } from '../db';
import { OrderDetail } from '../model';

describe('Database Tests', () => {
    afterAll(async () => {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM order_details;');
            await client.query('ALTER SEQUENCE order_details_id_seq RESTART WITH 1;');
        } finally {
            client.release();
        }
        await pool.end();
    });

    test('Create and retrieve OrderDetail', async () => {
        // Crear un nuevo OrderDetail con garrison como null
        const orderDetail = new OrderDetail(1, 1, 2, null);
        await OrderDetail.save(orderDetail);

        // Recuperar el OrderDetail guardado
        const savedOrderDetail = await OrderDetail.get(1);

        // Verificar que los datos sean correctos
        expect(savedOrderDetail).toMatchObject({
            product_id: 1,
            quantity: 1,
            desk_id: 2,
            garrison: null, // garrison debe ser null
        });
    });

    test('should fail to retrieve non-existent OrderDetail', async () => {
        const orderDetail = await OrderDetail.get(999);
        expect(orderDetail).toBeUndefined();
    });
});