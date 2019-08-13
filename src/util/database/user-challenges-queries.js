import { getPool } from './connection'

async function getUserChallenge(userId, challengeId) {
  const db = await getPool()

  return db.query('select * from user_challenges where userId = ? and challengeId = ?', [userId, challengeId])
}

// eslint-disable-next-line require-await
export async function createUserChallenges(connection, userChallengeValues) {
  return connection.query(
    `insert into user_challenges (userId, challengeId) 
      values ?`,
    [userChallengeValues]
  )
}

export async function getPendingUserChallenges() {
  const db = await getPool()

  return db.query(
    `select uc.userId, uc.challengeId, ck.keyId, uk.keyValue, ck.keyOrder, c.build_call 
    from user_challenges uc 
    left join challenges c on c.id = uc.challengeId 
    left join challenge_keys ck on uc.challengeId = ck.challengeId
    left join user_keys uk on uc.userId = uk.userId and ck.keyId = uk.keyId
    where uc.status = "pending and uk.keyValue != null "
    order by uc.userId, uc.challengeId, ck.keyOrder`
  )
}

// eslint-disable-next-line require-await
export async function processUserChallengeBuild(connection, userId, challengeId) {
  return connection.query('update user_challenges set status = "processing" where userId = ? and challengeId = ?', [
    userId,
    challengeId,
  ])
}

// eslint-disable-next-line require-await
export async function completeUserChallengeBuild(connection, userId, challengeId, downloadPath, challengeResult) {
  return connection.query(
    `update user_challenges 
      set downloadPath = ?, 
      challengeResult = ?, 
      status = "completed"
      where userId = ? and challengeId = ?`,
    [downloadPath, challengeResult, userId, challengeId]
  )
}

export async function solveUserChallenge(userId, challengeId, userResult) {
  const db = await getPool()

  const [[{ challengeResult }]] = await getUserChallenge(userId, challengeId)

  if (userResult === challengeResult) {
    return db.getConnection().then(async connection => {
      try {
        await connection.beginTransaction()

        const userChallenge = await connection.query(
          'update user_challenges set solved = true where userId = ? and challengeId = ?',
          [userId, challengeId]
        )

        await connection.commit()

        return userChallenge
      } catch (error) {
        await connection.rollback()

        throw error
      } finally {
        await connection.release()
      }
    })
  }

  throw new Error('Solved string does not match result')
}
