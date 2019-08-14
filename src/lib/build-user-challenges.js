import {
  completeUserChallengeBuild,
  getPendingUserChallenges,
  processUserChallengeBuild,
} from '../util/database/user-challenges-queries'
import { buildUserChallenge } from '../util/challenges/build-user-challenge'
import { getPool } from '../util/database/connection'

export async function buildUserChallenges(onComplete) {
  try {
    const [pendingChallenges] = await getPendingUserChallenges()

    const pendingChallengesByUser = pendingChallenges.reduce(
      (userChallenges, { userId, challengeId, keyId, keyValue, keyOrder, buildCall }) => ({
        ...userChallenges,
        [userId]: {
          [challengeId]: {
            buildCall,
            [keyOrder]: {
              keyId,
              keyValue,
            },
          },
        },
      }),
      {}
    )

    const dbPool = await getPool()
    const connection = await dbPool.getConnection()

    await connection.beginTransaction()

    try {
      for (const [userId, challenges] of Object.entries(pendingChallengesByUser)) {
        for (const [challengeId, challengeData] of Object.entries(challenges)) {
          await processUserChallengeBuild(connection, userId, challengeId)

          const { filePath, challengeResult } = await buildUserChallenge(userId, challengeId, challengeData)

          await completeUserChallengeBuild(connection, userId, challengeId, filePath, challengeResult)
        }
      }
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
    return onComplete(true)
  } catch (error) {
    return onComplete(true, error)
  }
}
