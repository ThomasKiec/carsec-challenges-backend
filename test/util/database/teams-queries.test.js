import { createTeam, deleteTeam, listTeams, listTeamsScores } from '../../../src/util/database/teams-queries'
import { getPool } from '../../../src/util/database/connection'

jest.mock('../../../src/util/database/connection')

describe('teams-queries', () => {
  const query = jest.fn()
  const commit = jest.fn()
  const rollback = jest.fn()
  const release = jest.fn()
  const beginTransaction = jest.fn()

  const connection = { beginTransaction, commit, query, release, rollback }
  const getConnection = jest.fn().mockResolvedValue(connection)

  beforeAll(() => {
    getPool.mockImplementation(() => ({
      ...connection,
      getConnection,
    }))
  })

  afterEach(() => {
    getPool.mockClear()
    getConnection.mockClear()

    query.mockReset()
    commit.mockReset()
    rollback.mockReset()
    release.mockReset()
    beginTransaction.mockReset()
  })

  describe('createTeam', () => {
    const team = Symbol('team')
    const teamName = 'teamName'

    it('creates team if it doesn´t exist', async () => {
      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce(team)

      await expect(createTeam(teamName)).resolves.toBe(team)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from teams where name = ?', [teamName])
      expect(query).toHaveBeenNthCalledWith(2, 'insert into teams (name) values(?)', [teamName])

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if team already exists', async () => {
      const error = new Error(`Team with name: "${teamName}" already exists`)
      query.mockResolvedValueOnce([[team]])

      await expect(createTeam(teamName)).rejects.toThrow(error)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from teams where name = ?', [teamName])

      expect(commit).not.toHaveBeenCalled()
    })

    it('throws error if database rejects while inserting team', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockRejectedValueOnce(error)

      await expect(createTeam(teamName)).rejects.toThrow(error)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('listTeams', () => {
    const teams = Symbol('teams')

    it('resolves with list of teams', async () => {
      query.mockResolvedValueOnce(teams)

      await expect(listTeams()).resolves.toBe(teams)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `select id, name
        from teams
        order by name`
      )
    })

    it('throws if database query fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listTeams()).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `select id, name
        from teams
        order by name`
      )
    })
  })

  describe('deleteTeam', () => {
    const teamId = Symbol('teamId')
    const deletedTeam = Symbol('deletedTeam')

    it('deletes team by given id', async () => {
      query.mockResolvedValueOnce(deletedTeam)

      await expect(deleteTeam(teamId)).resolves.toBe(deletedTeam)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('delete from teams where id = ?', [teamId])

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws if deletion fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(deleteTeam(teamId)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('delete from teams where id = ?', [teamId])

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('listTeamsScores', () => {
    const teamScores = Symbol('teamScores')

    it('deletes team by given id', async () => {
      query.mockResolvedValueOnce(teamScores)

      await expect(listTeamsScores()).resolves.toBe(teamScores)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`
  select t.id, t.name, if(sum(scores.points) is null, 0, sum(scores.points)) points 
  from teams t left join ( 
    select u.id userId, u.teamId, uc.challengeId, c.points 
    from users u left join user_challenges uc on u.id = uc.userId 
    left join challenges c on uc.challengeId = c.id 
    where uc.solved = 1) scores on t.id = scores.teamId 
  group by t.id 
  order by points desc`)

      expect(getPool).toHaveBeenCalledTimes(1)
    })

    it('throws if deletion fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listTeamsScores()).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`
  select t.id, t.name, if(sum(scores.points) is null, 0, sum(scores.points)) points 
  from teams t left join ( 
    select u.id userId, u.teamId, uc.challengeId, c.points 
    from users u left join user_challenges uc on u.id = uc.userId 
    left join challenges c on uc.challengeId = c.id 
    where uc.solved = 1) scores on t.id = scores.teamId 
  group by t.id 
  order by points desc`)

      expect(getPool).toHaveBeenCalledTimes(1)
    })
  })
})
