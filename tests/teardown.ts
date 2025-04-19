import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

module.exports = async () => {
    const client = new Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    });

    try {
        await client.connect();

        // Forzar la desconexión de todas las conexiones activas
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'admincontroller_test'
              AND pid <> pg_backend_pid();
        `);

        // Eliminar la base de datos
        await client.query('DROP DATABASE IF EXISTS admincontroller_test;');
        console.log('Base de datos de prueba eliminada: admincontroller_test');
    } catch (error) {
        console.error('Error al eliminar la base de datos de prueba:', error);
    } finally {
        await client.end();
    }
};