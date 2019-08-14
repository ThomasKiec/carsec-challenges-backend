import {
  completeUserChallengeBuild,
  createUserChallenges,
  getPendingUserChallenges,
  processUserChallengeBuild,
  solveUserChallenge,
} from '../../../src/util/database/user-challenges-queries'
import { getPool } from '../../../src/util/database/connection'

jest.mock('../../../src/util/database/connection')

describe('user-challenges-queries', () => {
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

  describe('createUserChallenges', () => {
    const userChallengeValues = Symbol('userChallengesValues')
    const insertIds = Symbol('insertIds')

    it('inserts given user challenges', async () => {
      query.mockResolvedValueOnce(insertIds)

      await expect(createUserChallenges(connection, userChallengeValues)).resolves.toBe(insertIds)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `insert into user_challenges (userId, challengeId) 
      values ?`,
        [userChallengeValues]
      )
    })

    it('throws error if database reject while inserting', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(createUserChallenges(connection, userChallengeValues)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `insert into user_challenges (userId, challengeId) 
      values ?`,
        [userChallengeValues]
      )
    })
  })

  describe('getPendingUserChallenges', () => {
    const pendingUserChallenges = Symbol('pendingUserChallenges')

    it('resolves pending user challenges', async () => {
      query.mockResolvedValueOnce(pendingUserChallenges)

      await expect(getPendingUserChallenges()).resolves.toBe(pendingUserChallenges)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `select uc.userId, uc.challengeId, ck.keyId, uk.keyValue, ck.keyOrder, c.build_call 
    from user_challenges uc 
    left join challenges c on c.id = uc.challengeId 
    left join challenge_keys ck on uc.challengeId = ck.challengeId
    left join user_keys uk on uc.userId = uk.userId and ck.keyId = uk.keyId
    where uc.status = "pending and uk.keyValue != null "
    order by uc.userId, uc.challengeId, ck.keyOrder`
      )
    })

    it('throws error if database rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(getPendingUserChallenges()).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('processUserChallengeBuild', () => {
    const userId = Symbol('userId')
    const challengeId = Symbol('challengeId')

    const response = Symbol('response')

    it('updated user challenges by given userId and challengeId', async () => {
      query.mockResolvedValueOnce(response)

      await expect(processUserChallengeBuild(connection, userId, challengeId)).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        'update user_challenges set status = "processing" where userId = ? and challengeId = ?',
        [userId, challengeId]
      )
    })

    it('throws error if database rejects while updating user challenges', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(processUserChallengeBuild(connection, userId, challengeId)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('completeUserChallengeBuild', () => {
    const userId = Symbol('userId')
    const challengeId = Symbol('challengeId')
    const downloadPath = Symbol('downloadPath')
    const challengeResult = Symbol('challengeResult')

    const response = Symbol('response')

    it('updates status, downloadPath and challengeResult of user challenge for given userId and challengeId', async () => {
      query.mockResolvedValueOnce(response)

      await expect(
        completeUserChallengeBuild(connection, userId, challengeId, downloadPath, challengeResult)
      ).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `update user_challenges 
      set downloadPath = ?, 
      challengeResult = ?, 
      status = "completed"
      where userId = ? and challengeId = ?`,
        [downloadPath, challengeResult, userId, challengeId]
      )
    })

    it('throws error if database rejects while updating user challenges', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(
        completeUserChallengeBuild(connection, userId, challengeId, downloadPath, challengeResult)
      ).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('solveUserChallenge', () => {
    const challengeResult = 'challengeResult'
    const userId = Symbol('userId')
    const challengeId = Symbol('challengeId')

    const response = Symbol('response')

    it('updates user challenge with solved = true if results are equal', async () => {
      query.mockResolvedValueOnce([[{ challengeResult }]]).mockResolvedValueOnce(response)

      await expect(solveUserChallenge(userId, challengeId, challengeResult)).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from user_challenges where userId = ? and challengeId = ?', [
        userId,
        challengeId,
      ])
      expect(query).toHaveBeenNthCalledWith(
        2,
        'update user_challenges set solved = true where userId = ? and challengeId = ?',
        [userId, challengeId]
      )

      expect(getPool).toHaveBeenCalledTimes(2)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if results do not match', async () => {
      const error = new Error('Solved string does not match result')

      query.mockResolvedValueOnce([[{ challengeResult }]]).mockResolvedValueOnce(response)

      await expect(solveUserChallenge(userId, challengeId, 'someOtherResult')).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
      expect(getPool).toHaveBeenCalledTimes(2)

      expect(getConnection).not.toHaveBeenCalled()
      expect(beginTransaction).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
      expect(rollback).not.toHaveBeenCalled()
      expect(release).not.toHaveBeenCalled()
    })

    it('throws error if database rejects while updating user challenge', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[{ challengeResult }]]).mockRejectedValueOnce(error)

      await expect(solveUserChallenge(userId, challengeId, challengeResult)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenCalledTimes(2)

      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })
})
