import { getPool } from './connection'

// eslint-disable-next-line require-await
export async function createUserKey(connection, keyId, userId) {
  return connection.query('insert into user_keys(keyId, userId) values(?, ?)', [keyId, userId])
}

export async function updateUserKey(userKeys, userId) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      const updatedUserKeys = await Promise.all(
        userKeys.map(({ keyValue, keyId }) =>
          connection.query('update user_keys set keyValue = ? where keyId = ? and userId = ?', [
            keyValue,
            keyId,
            userId,
          ])
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

  return db.query(
    `
  select uk.keyId, uk.keyValue, hk.name,
  if(uk.keyValue is null, FALSE, TRUE) disabled
  from user_keys uk left join hardware_keys hk on uk.keyId = hk.id 
  where uk.userId = ?`,
    [userId]
  )
}

export async function deleteUserKeyValues(userId) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      const [deletedUserKeyValues] = await connection.query(
        `
        update user_keys set keyValue = null where userId = ?`,
        [userId]
      )

      await connection.commit()

      return deletedUserKeyValues
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}
