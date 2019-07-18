import { createUserKey } from './user-keys-queries'
import { getPool } from './connection'
import { listUsers } from './user-queries'

// eslint-disable-next-line require-await
async function getHardwareKeyByName(db, name) {
  return db.query('select * from hardware_keys where name = ?', [name])
}

export async function createHardwareKey(name) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      const [hardwareKeyByName] = await getHardwareKeyByName(db, name)

      if (!hardwareKeyByName.length) {
        const [{ insertId }] = await connection.query('insert into hardware_keys (name) values(?)', [name])

        const [users] = await listUsers()

        for (const { id: userId } of users) {
          await createUserKey(connection, insertId, userId)
        }

        await connection.commit()

        return { insertId }
      }

      throw new Error(`Hardware key with name: "${name}" already exists`)
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}

export async function deleteHardwareKey(id) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      const deletedHardwareKey = await connection.query('delete from hardware_keys where id = ?', [id])

      await connection.commit()

      return deletedHardwareKey
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}

export async function listHardwareKeys() {
  const db = await getPool()

  return db.query(`
  select id, name 
  from hardware_keys 
  order by name`)
}
