import { getPool } from './connection'

// eslint-disable-next-line require-await
async function getTeamByName(db, name) {
  return db.query('select * from teams where name = ?', [name])
}

export async function createTeam(name) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      await connection.beginTransaction()

      const [teamByName] = await getTeamByName(db, name)

      if (!teamByName.length) {
        const team = await connection.query('insert into teams (name) values(?)', [name])

        await connection.commit()

        return team
      }
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}

export async function listTeams() {
  const db = await getPool()

  return db.query(
    `select id, name
        from teams
        order by name`
  )
}

export async function deleteTeam(teamId) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
      await connection.beginTransaction()

      const deletedTeam = await connection.query('delete from teams where id = ?', [teamId])

      await connection.commit()

      return deletedTeam
    } catch (error) {
      await connection.rollback()

      throw error
    } finally {
      await connection.release()
    }
  })
}

export async function listTeamsScores() {
  const db = await getPool()

  return db.query(`
  select t.id, t.name, if(sum(scores.points) is null, 0, sum(scores.points)) points 
  from teams t left join ( 
    select u.id userId, u.teamId, uc.challengeId, c.points 
    from users u left join user_challenges uc on u.id = uc.userId 
    left join challenges c on uc.challengeId = c.id 
    where uc.solved = 1) scores on t.id = scores.teamId 
  group by t.id 
  order by points desc`)
}
