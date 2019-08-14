import {
  createChallenge,
  deleteChallengeById,
  listChallenges,
  listUserChallenges,
} from '../../../src/util/database/challenges-queries'
import { createChallengeKeys } from '../../../src/util/database/challenge-keys-queries'
import { createUserChallenges } from '../../../src/util/database/user-challenges-queries'
import { getPool } from '../../../src/util/database/connection'
import { listUsers } from '../../../src/util/database/user-queries'

jest.mock('../../../src/util/database/challenge-keys-queries')
jest.mock('../../../src/util/database/user-challenges-queries')
jest.mock('../../../src/util/database/connection')
jest.mock('../../../src/util/database/user-queries')

describe('challenges-queries', () => {
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

    createChallengeKeys.mockReset()
    createUserChallenges.mockReset()
    listUsers.mockReset()
  })

  describe('listChallenges', () => {
    it('resolves challenges', async () => {
      const challenges = Symbol('challenges')

      query.mockResolvedValueOnce(challenges)

      await expect(listChallenges()).resolves.toBe(challenges)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from challenges')
    })

    it('throws error if query rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listChallenges()).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from challenges')
    })
  })

  describe('listUserChallenges', () => {
    const userId = 'userId'

    it('resolves user challenges', async () => {
      const userChallenges = Symbol('userChallenges')

      query.mockResolvedValueOnce(userChallenges)

      await expect(listUserChallenges(userId)).resolves.toBe(userChallenges)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `select c.*, uc.solved, uc.status
    from challenges c left join user_challenges uc on c.id = uc.challengeId 
    where uc.userId = ?
    order by c.topic, c.title, c.points`,
        [userId]
      )
    })

    it('throws error if query rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listUserChallenges(userId)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `select c.*, uc.solved, uc.status
    from challenges c left join user_challenges uc on c.id = uc.challengeId 
    where uc.userId = ?
    order by c.topic, c.title, c.points`,
        [userId]
      )
    })
  })

  describe('createChallenge', () => {
    const project = 'project'
    const title = 'title'
    const points = 'points'
    const topic = 'topic'
    const buildCall = 'buildCall'
    const description = 'description'

    const firstChallengeKey = Symbol('firstChallengeKey')
    const secondChallengeKey = Symbol('secondChallengeKey')

    const insertId = Symbol('insertId')

    const users = [{ id: 1 }, { id: 2 }]

    it('creates challenge, userChallenges and challengeKeys if it doesn´t exist', async () => {
      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId }])
      listUsers.mockResolvedValueOnce([users])

      await expect(
        createChallenge(project, title, points, topic, buildCall, description, [firstChallengeKey, secondChallengeKey])
      ).resolves.toEqual({ insertId })

      expect(getPool).toHaveBeenCalledTimes(2)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from challenges where title  = ?', [title])
      expect(query).toHaveBeenNthCalledWith(
        2,
        `insert into challenges (project, title, points, topic, build_call, description)
              values(?, ?, ?, ?, ?, ?)`,
        [project, title, points, topic, buildCall, description]
      )

      expect(listUsers).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).toHaveBeenCalledTimes(1)
      expect(createUserChallenges).toHaveBeenCalledWith(connection, [[users[0].id, insertId], [users[1].id, insertId]])

      expect(createChallengeKeys).toHaveBeenCalledTimes(1)
      expect(createChallengeKeys).toHaveBeenCalledWith(connection, [
        [firstChallengeKey, insertId, 1],
        [secondChallengeKey, insertId, 2],
      ])

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if insert challenge query fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockRejectedValueOnce(error)

      await expect(
        createChallenge(project, title, points, topic, buildCall, description, [firstChallengeKey, secondChallengeKey])
      ).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from challenges where title  = ?', [title])
      expect(query).toHaveBeenNthCalledWith(
        2,
        `insert into challenges (project, title, points, topic, build_call, description)
              values(?, ?, ?, ?, ?, ?)`,
        [project, title, points, topic, buildCall, description]
      )

      expect(listUsers).not.toHaveBeenCalled()
      expect(createUserChallenges).not.toHaveBeenCalled()
      expect(createChallengeKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
    })

    it('throws error if users could not be queried ', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId }])
      listUsers.mockRejectedValueOnce(error)

      await expect(
        createChallenge(project, title, points, topic, buildCall, description, [firstChallengeKey, secondChallengeKey])
      ).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from challenges where title  = ?', [title])
      expect(query).toHaveBeenNthCalledWith(
        2,
        `insert into challenges (project, title, points, topic, build_call, description)
              values(?, ?, ?, ?, ?, ?)`,
        [project, title, points, topic, buildCall, description]
      )

      expect(listUsers).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).not.toHaveBeenCalled()
      expect(createChallengeKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
    })

    it('throws error if user challenges could not be created', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId }])
      listUsers.mockResolvedValueOnce([users])
      createUserChallenges.mockRejectedValueOnce(error)

      await expect(
        createChallenge(project, title, points, topic, buildCall, description, [firstChallengeKey, secondChallengeKey])
      ).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from challenges where title  = ?', [title])
      expect(query).toHaveBeenNthCalledWith(
        2,
        `insert into challenges (project, title, points, topic, build_call, description)
              values(?, ?, ?, ?, ?, ?)`,
        [project, title, points, topic, buildCall, description]
      )

      expect(listUsers).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).toHaveBeenCalledTimes(1)
      expect(createUserChallenges).toHaveBeenCalledWith(connection, [[users[0].id, insertId], [users[1].id, insertId]])

      expect(createChallengeKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()

      expect(release).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
    })

    it('throws error if challenge already exists', async () => {
      const error = new Error(`The challenge with title: "${title}" already exists`)
      const challenge = Symbol('challenge')

      query.mockResolvedValueOnce([[challenge]])

      await expect(
        createChallenge(project, title, points, topic, buildCall, description, [firstChallengeKey, secondChallengeKey])
      ).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from challenges where title  = ?', [title])

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
      expect(listUsers).not.toHaveBeenCalled()
      expect(createUserChallenges).not.toHaveBeenCalled()
      expect(createChallengeKeys).not.toHaveBeenCalled()
    })
  })

  describe('deleteChallengeById', () => {
    const challengeId = 'challengeId'

    it('deletes challenge by id', async () => {
      const deletedChallenge = Symbol('deletedChallenge')

      query.mockResolvedValueOnce([deletedChallenge])

      await expect(deleteChallengeById(challengeId)).resolves.toBe(deletedChallenge)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('delete from challenges where id = ?', [challengeId])

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if challenge could not be deleted', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(deleteChallengeById(challengeId)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('delete from challenges where id = ?', [challengeId])

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })
})
