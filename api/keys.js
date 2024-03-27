import dotenv from 'dotenv'
dotenv.config();

export const database = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.DBPORT,
    database: process.env.DBNAME
};