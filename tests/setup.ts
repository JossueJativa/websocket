// filepath: c:\Users\user\GitRepositories\UDLA\ProyectoCapstone\websocket\tests\setup.ts
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
        await client.query('CREATE DATABASE admincontroller_test;');
        console.log('Base de datos de prueba creada: admincontroller_test');

        // Conectar a la base de datos de prueba para crear las tablas
        await client.end();
        const testClient = new Client({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            password: process.env.POSTGRES_PASSWORD,
            database: 'admincontroller_test',
            port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        });

        await testClient.connect();
        await testClient.query(`
            CREATE TABLE IF NOT EXISTS order_details (
                id SERIAL PRIMARY KEY,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                desk_id INT NOT NULL,
                garrison TEXT
            );
        `);
        console.log('Tabla order_details creada en la base de datos de prueba.');
        await testClient.end();
    } catch (error) {
        console.error('Error al configurar la base de datos de prueba:', error);
    }
};