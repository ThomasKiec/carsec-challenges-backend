import { createChallengeKeys } from './challenge-keys-queries'
import { createUserChallenges } from './user-challenges-queries'
import { getPool } from './connection'
import { listUsers } from './user-queries'

async function getChallengeByTitle(title) {
  const db = await getPool()

  return db.query('select * from challenges where title  = ?', [title])
}

export async function listChallenges() {
  const db = await getPool()

  return db.query('select * from challenges')
}

export async function listUserChallenges(userId) {
  const db = await getPool()

  return db.query(
    `select c.*, uc.solved, uc.status
    from challenges c left join user_challenges uc on c.id = uc.challengeId 
    where uc.userId = ?
    order by c.topic, c.title, c.points`,
    [userId]
  )
}

export async function createChallenge(project, title, points, topic, buildCall, description, challengeKeys) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      await connection.beginTransaction()

      const [challengesByTitle] = await getChallengeByTitle(title)

      if (!challengesByTitle.length) {
        const [{ insertId }] = await connection.query(
          `insert into challenges (project, title, points, topic, build_call, description)
              values(?, ?, ?, ?, ?, ?)`,
          [project, title, points, topic, buildCall, description]
        )

        const [users] = await listUsers()

        const userChallengeValues = users.map(({ id: userId }) => [userId, insertId])

        if (userChallengeValues.length) {
          await createUserChallenges(connection, userChallengeValues)
        }

        let counter = 1

        const challengeKeyValues = []

        for (const keyId of challengeKeys) {
          challengeKeyValues.push([keyId, insertId, counter])

          counter++
        }

        if (challengeKeyValues.length) {
          await createChallengeKeys(connection, challengeKeyValues)
        }

        await connection.commit()

        return { insertId }
      }

      throw new Error(`The challenge with title: "${title}" already exists`)
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}

export async function deleteChallengeById(challengeId) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      await connection.beginTransaction()

      const [deletedChallenge] = await connection.query('delete from challenges where id = ?', [challengeId])

      await connection.commit()

      return deletedChallenge
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}
