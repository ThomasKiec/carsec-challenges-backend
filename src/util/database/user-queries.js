import { getPool } from './connection'

export async function listUsers() {
  const db = await getPool()

  return db.query('select * from users')
}

export async function getUserById(userId) {
  const db = await getPool()

  return db.query(`select * from users where id = ${userId}`)
}

// eslint-disable-next-line require-await
export async function getUsersByEmail(email) {
  const db = await getPool()

  return db.query(`select * from users where email = "${email}"`)
}

export async function createUser(email, passwordHash, role) {
  const db = await getPool()
  const [user] = await db.query(
    `insert into users (role, email, password) values("${role}", "${email}", "${passwordHash}")`
  )

  return user
}
