import { getPool } from './connection'

// eslint-disable-next-line require-await
export async function createUserKey(connection, keyId, userId) {
  return connection.query('insert into user_keys(keyId, userId) values(?, ?)', [keyId, userId])
}

export async function updateUserKey(userKeys) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      const updatedUserKeys = await Promise.all(
        userKeys.map(({ keyValue, keyId }) =>
          connection.query('update user_keys set keyValue = ? where keyId = ?', [keyValue, keyId])
        )
      )

      await connection.commit()

      return updatedUserKeys
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      connection.release()
    }
  })
}

export async function getUserKeys(userId) {
  const db = await getPool()

  // Join with hardware keys

  return db.query('select keyId, userId, keyValue from user_keys where userId = ?', [userId])
}
