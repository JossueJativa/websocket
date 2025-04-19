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
    } catch (error) {
        console.error('Error al crear la base de datos de prueba:', error);
    } finally {
        await client.end();
    }
};