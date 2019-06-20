import { createPool } from 'mysql2/promise'

let pool

export async function getPool() {
  if (!pool) {
    const db = await createPool({
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
    })

    pool = db
  }

  return pool
}
