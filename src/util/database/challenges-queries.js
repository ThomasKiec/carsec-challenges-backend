import { buildUserChallenge } from '../challenges/build-user-challenge'
import { createUserChallenge } from './user-challenges-queries'
import { getPool } from './connection'
import { listUsers } from './user-queries'

async function getChallengeByTitle(title) {
  const db = await getPool()

  return db.query(`select * from challenges where title  = "${title}"`)
}

export async function listChallenges(userId) {
  const db = await getPool()

  return db.query(
    `select c.*, uc.solved 
    from challenges c left join userChallenges uc on c.id = uc.challengeId 
    where uc.userId = ${userId}`
  )
}

export async function createChallenge(project, title, points, topic, buildCall, description) {
  const db = await getPool()

  try {
    const [challengesByTitle] = await getChallengeByTitle(title)

    if (!challengesByTitle.length) {
      const [{ insertId }] = await db.query(
        `insert into challenges (project, title, points, topic, build_call, description)
            values("${project}", "${title}", "${points}", "${topic}", "${buildCall}", "${description}")`
      )

      const [users] = await listUsers()

      for (const { id: userId } of users) {
        const { challengeResult, filePath } = await buildUserChallenge(userId, insertId)
        await createUserChallenge(userId, insertId, filePath, challengeResult)
      }

      return { insertId }
    }

    throw new Error(`challenge with title: "${title}" already exists`)
  } catch (error) {
    throw error
  }
}

export async function deleteChallengeById(challengeId) {
  const db = await getPool()

  return Promise.all([
    db.query(`delete from challenges where id = "${challengeId}"`),
    db.query(`delete from userChallenges where challengeId = "${challengeId}"`),
  ])
}
