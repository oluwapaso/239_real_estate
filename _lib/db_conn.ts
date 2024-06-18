import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.NEXT_PUBLIC_DB_HOST,
    port: process.env.NEXT_PUBLIC_DB_PORT as unknown as number,
    user: process.env.NEXT_PUBLIC_DB_USER,
    password: process.env.NEXT_PUBLIC_DB_PWORD,
    database: process.env.NEXT_PUBLIC_DB_NAME,
    waitForConnections: true,
    connectionLimit: 25,
    queueLimit: 0,
})
console.log("process.env.NEXT_PUBLIC_DB_HOST:", process.env.NEXT_PUBLIC_DB_HOST)
console.log("process.env.NEXT_PUBLIC_DB_USER:", process.env.NEXT_PUBLIC_DB_USER)
console.log("process.env.NEXT_PUBLIC_DB_PWORD:", process.env.NEXT_PUBLIC_DB_PWORD)
console.log("process.env.NEXT_PUBLIC_DB_NAME:", process.env.NEXT_PUBLIC_DB_NAME)
export default pool