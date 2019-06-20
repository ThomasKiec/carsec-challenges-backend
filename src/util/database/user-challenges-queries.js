import { getPool } from './connection'

async function getUserChallenge(userId, challengeId) {
  const db = await getPool()

  return db.query(`select * from userChallenges where userId = ${userId} and challengeId = ${challengeId}`)
}

export async function createUserChallenge(userId, challengeId, downloadPath, challengeResult) {
  const db = await getPool()

  return db.query(
    `insert into userChallenges (userId, challengeId, downloadPath, challengeResult) 
      values("${userId}", "${challengeId}", "${downloadPath}", "${challengeResult}")`
  )
}

export async function solveUserChallenge(userId, challengeId, userResult) {
  const db = await getPool()

  const [[{ challengeResult }]] = await getUserChallenge(userId, challengeId)

  if (userResult === challengeResult) {
    return db.query(`update userChallenges set solved = true where userId = ${userId} and challengeId = ${challengeId}`)
  }

  throw new Error('Solved string does not match result')
}
