import {
  completeUserChallengeBuild,
  getPendingUserChallenges,
  processUserChallengeBuild,
} from '../util/database/user-challenges-queries'
import { buildUserChallenge } from '../util/challenges/build-user-challenge'
import { getPool } from '../util/database/connection'

export async function buildUserChallenges(onComplete) {
  try {
    const [pendingChallenges] = await getPendingUserChallenges(5)

    const dbPool = await getPool()
    const connection = await dbPool.getConnection()

    try {
      for (const challenge of pendingChallenges) {
        const { userId, challengeId, build_call: buildCall } = challenge
        // Filehandler will get a challenge file and stores it with scalable-blob-store

        await processUserChallengeBuild(connection, userId, challengeId)

        const { challengeResult, filePath } = await buildUserChallenge(buildCall)

        await completeUserChallengeBuild(connection, userId, challengeId, filePath, challengeResult)
      }
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }

    return onComplete(true)
  } catch (error) {
    // set processingChallenges back to status pending

    return onComplete(true, error)
  }
}
