import { Socket } from 'socket.io';
import { OrderDetail } from '../model';

export const validateDeskId = (desk_id: string, callback: Function): boolean => {
    if (!desk_id) {
        callback({ message: 'Desk ID is required' }, null);
        return false;
    }
    return true;
};

export const handleExistingOrder = async (
    getOrderDetail: any[], product_id: string,
    quantity: number, desk_id: number,
    garrison: number[] | null,
    socket: Socket, callback: Function
) => {
    const existingOrder = getOrderDetail.find((order: any) => order.product_id === product_id);
    if (existingOrder) {
        if (existingOrder.garrison) {
            const garrisons = existingOrder.garrison;
            if (!(garrison && garrisons.length === garrison.length && garrisons.every((val: number) => garrison.includes(val)))) {
                // Si los garrisons son distintos, creamos una nueva orden
                const newOrderDetail = new OrderDetail(
                    existingOrder.product_id,
                    quantity,
                    desk_id,
                    garrison
                );
                await OrderDetail.save(newOrderDetail);
                socket.to(`${desk_id}`).emit('order:details', await OrderDetail.getAll(desk_id));
                callback(null, newOrderDetail);
                return true;
            }
        }
        existingOrder.quantity += quantity;
        await OrderDetail.update(existingOrder, existingOrder.id);

        // Emit updated order to all clients in the desk
        socket.to(`${desk_id}`).emit('order:details', await OrderDetail.getAll(desk_id));
        callback(null, existingOrder);
        return true;
    }
    return false;
};