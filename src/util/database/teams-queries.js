import { getPool } from './connection'

// eslint-disable-next-line require-await
async function getTeamByName(db, name) {
  return db.query('select * from teams where name = ?', [name])
}

export async function createTeam(name) {
  const db = await getPool()

  return db.getConnection().then(async connection => {
    try {
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
