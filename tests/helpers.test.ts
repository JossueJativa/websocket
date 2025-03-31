// Primero mockeamos el módulo antes de cualquier importación
jest.mock('../model', () => {
    // Aquí creamos mocks inline para evitar problemas de referencia
    return {
        OrderDetail: class {
            product_id: number;
            quantity: number;
            desk_id: number;
            garrison: number[] | null;

            constructor(product_id: number, quantity: number, desk_id: number, garrison: number[] | null) {
                if (!product_id || !quantity || !desk_id) {
                    throw new Error('Invalid data');
                }
                this.product_id = product_id;
                this.quantity = quantity;
                this.desk_id = desk_id;
                this.garrison = garrison;
            }

            // Creamos los mocks directamente aquí
            static save = jest.fn().mockResolvedValue(undefined);
            static update = jest.fn().mockResolvedValue(undefined);
            static delete = jest.fn().mockResolvedValue(undefined);
            static deleteAll = jest.fn().mockResolvedValue(0);
            static get = jest.fn().mockResolvedValue(null);
            static getAll = jest.fn().mockResolvedValue([]);
        }
    };
});

// Luego importamos todo lo que necesitamos
import { Socket } from 'socket.io';
import { OrderDetail } from '../model';
import { validateDeskId, handleExistingOrder } from '../helpers';

// Obtenemos referencias a los mocks para usarlos en los tests
const mockSave = OrderDetail.save as jest.Mock;
const mockUpdate = OrderDetail.update as jest.Mock;
const mockGetAll = OrderDetail.getAll as jest.Mock;

describe('validateDeskId', () => {
    test('debería retornar false cuando desk_id es vacío', () => {
        const callback = jest.fn();
        const result = validateDeskId('', callback);

        expect(result).toBe(false);
        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    test('debería retornar false cuando desk_id es undefined', () => {
        const callback = jest.fn();
        const result = validateDeskId(undefined as any, callback);

        expect(result).toBe(false);
        expect(callback).toHaveBeenCalledWith({ message: 'Desk ID is required' }, null);
    });

    test('debería retornar true cuando desk_id es válido', () => {
        const callback = jest.fn();
        const result = validateDeskId('123', callback);

        expect(result).toBe(true);
        expect(callback).not.toHaveBeenCalled();
    });
});

describe('handleExistingOrder', () => {
    // Mock para Socket.io
    let mockSocket: any;
    let mockCallback: jest.Mock;

    beforeEach(() => {
        mockSocket = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };
        mockCallback = jest.fn();
        // Limpiar los mocks entre pruebas
        jest.clearAllMocks();
    });

    test('debería retornar false cuando no hay orden existente', async () => {
        const getOrderDetail: any[] = [];
        const product_id = '123';
        const quantity = 2;
        const desk_id = 1;
        const garrison = [1, 2, 3];

        const result = await handleExistingOrder(
            getOrderDetail,
            product_id,
            quantity,
            desk_id,
            garrison,
            mockSocket as Socket,
            mockCallback
        );

        expect(result).toBe(false);
        expect(mockCallback).not.toHaveBeenCalled();
        expect(mockSocket.to).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    test('debería crear una nueva orden cuando los garrisons son diferentes', async () => {
        const existingOrder = {
            id: 1,
            product_id: '123',
            quantity: 2,
            desk_id: 1,
            garrison: [1, 2]
        };
        const getOrderDetail = [existingOrder];
        const product_id = '123';
        const quantity = 1;
        const desk_id = 1;
        const garrison = [1, 3]; // Diferente del garrison existente [1, 2]

        // Mock del método getAll para retornar datos después de guardar
        mockGetAll.mockResolvedValueOnce([existingOrder, { product_id, quantity, desk_id, garrison }]);

        const result = await handleExistingOrder(
            getOrderDetail,
            product_id,
            quantity,
            desk_id,
            garrison,
            mockSocket as Socket,
            mockCallback
        );

        expect(result).toBe(true);
        expect(mockSave).toHaveBeenCalled();
        expect(mockSocket.to).toHaveBeenCalledWith(`${desk_id}`);
        expect(mockSocket.emit).toHaveBeenCalledWith('order:details', expect.any(Array));
        expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
            product_id,
            quantity,
            desk_id,
            garrison
        }));
    });

    test('debería actualizar la cantidad de la orden existente cuando los garrisons son iguales', async () => {
        const existingOrder = {
            id: 1,
            product_id: '123',
            quantity: 2,
            desk_id: 1,
            garrison: [1, 2, 3]
        };
        const getOrderDetail = [existingOrder];
        const product_id = '123';
        const quantity = 3;
        const desk_id = 1;
        const garrison = [1, 2, 3]; // Mismo garrison que el existente

        // Mock del método getAll para retornar datos después de actualizar
        mockGetAll.mockResolvedValueOnce([{ ...existingOrder, quantity: 5 }]);

        const result = await handleExistingOrder(
            getOrderDetail,
            product_id,
            quantity,
            desk_id,
            garrison,
            mockSocket as Socket,
            mockCallback
        );

        expect(result).toBe(true);
        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ quantity: 5 }), // 2 + 3 = 5
            existingOrder.id
        );
        expect(mockSocket.to).toHaveBeenCalledWith(`${desk_id}`);
        expect(mockSocket.emit).toHaveBeenCalledWith('order:details', expect.any(Array));
        expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
            quantity: 5
        }));
    });

    test('debería actualizar la cantidad cuando la orden existente no tiene garrison', async () => {
        const existingOrder = {
            id: 1,
            product_id: '123',
            quantity: 2,
            desk_id: 1,
            garrison: null
        };
        const getOrderDetail = [existingOrder];
        const product_id = '123';
        const quantity = 3;
        const desk_id = 1;
        const garrison = null;

        // Mock del método getAll para retornar datos después de actualizar
        mockGetAll.mockResolvedValueOnce([{ ...existingOrder, quantity: 5 }]);

        const result = await handleExistingOrder(
            getOrderDetail,
            product_id,
            quantity,
            desk_id,
            garrison,
            mockSocket as Socket,
            mockCallback
        );

        expect(result).toBe(true);
        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ quantity: 5 }), // 2 + 3 = 5
            existingOrder.id
        );
        expect(mockSocket.to).toHaveBeenCalledWith(`${desk_id}`);
        expect(mockSocket.emit).toHaveBeenCalledWith('order:details', expect.any(Array));
        expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
            quantity: 5
        }));
    });

    test('debería crear una nueva orden cuando la orden tiene garrison pero la nueva no', async () => {
        const existingOrder = {
            id: 1,
            product_id: '123',
            quantity: 2,
            desk_id: 1,
            garrison: [1, 2]
        };
        const getOrderDetail = [existingOrder];
        const product_id = '123';
        const quantity = 3;
        const desk_id = 1;
        const garrison = null; // La nueva orden no tiene garrison

        // Mock del método getAll para retornar datos después de guardar
        mockGetAll.mockResolvedValueOnce([
            existingOrder,
            { product_id, quantity, desk_id, garrison }
        ]);

        const result = await handleExistingOrder(
            getOrderDetail,
            product_id,
            quantity,
            desk_id,
            garrison,
            mockSocket as Socket,
            mockCallback
        );

        expect(result).toBe(true);
        expect(mockSave).toHaveBeenCalled();
        expect(mockSocket.to).toHaveBeenCalledWith(`${desk_id}`);
        expect(mockSocket.emit).toHaveBeenCalledWith('order:details', expect.any(Array));
        expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
            product_id,
            quantity,
            desk_id,
            garrison
        }));
    });
});
