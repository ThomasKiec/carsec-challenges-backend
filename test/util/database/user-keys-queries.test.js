import {
  createUserKeys,
  deleteUserKeyValues,
  getUserKeys,
  updateUserKey,
} from '../../../src/util/database/user-keys-queries'
import { getPool } from '../../../src/util/database/connection'

jest.mock('../../../src/util/database/connection')

describe('user-keys-queries', () => {
  const query = jest.fn()
  const commit = jest.fn()
  const rollback = jest.fn()
  const release = jest.fn()
  const beginTransaction = jest.fn()

  const connection = { beginTransaction, commit, query, release, rollback }
  const getConnection = jest.fn().mockResolvedValue(connection)

  const response = Symbol('response')

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

  describe('createUserKeys', () => {
    const userKeyValues = Symbol('userKeyValues')

    it('creates user key values for the given user key values', async () => {
      query.mockResolvedValueOnce(response)

      await expect(createUserKeys(connection, userKeyValues)).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('insert into user_keys (keyId, userId) values ?', [userKeyValues])
    })

    it('throws if database rejetcs while inserting user keys', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(createUserKeys(connection, userKeyValues)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateUserKey', () => {
    const firstKey = { keyId: Symbol('keyIdFirstKey'), keyValue: Symbol('keyValueFirstKey') }
    const secondKey = { keyId: Symbol('keyIdSecondKey'), keyValue: Symbol('keyValueSecondKey') }

    const userId = Symbol('userId')

    it('updates user keys for given userId', async () => {
      query.mockResolvedValueOnce(response).mockResolvedValueOnce(response)

      await expect(updateUserKey([firstKey, secondKey], userId)).resolves.toEqual([response, response])

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'update user_keys set keyValue = ? where keyId = ? and userId = ?', [
        firstKey.keyValue,
        firstKey.keyId,
        userId,
      ])
      expect(query).toHaveBeenNthCalledWith(2, 'update user_keys set keyValue = ? where keyId = ? and userId = ?', [
        secondKey.keyValue,
        secondKey.keyId,
        userId,
      ])

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if database rejects while updating user keys', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error).mockResolvedValueOnce(response)

      await expect(updateUserKey([firstKey, secondKey], userId)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(2)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('getUserKeys', () => {
    const userId = Symbol('userId')

    it('resolves with list of user keys for the given userId', async () => {
      query.mockResolvedValueOnce(response)

      await expect(getUserKeys(userId)).resolves.toBe(response)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `
  select uk.keyId, uk.keyValue, hk.name,
  if(uk.keyValue is null, FALSE, TRUE) disabled
  from user_keys uk left join hardware_keys hk on uk.keyId = hk.id 
  where uk.userId = ?`,
        [userId]
      )
    })

    it('throws error if database rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(getUserKeys(userId)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteUserKeyValues', () => {
    const userId = Symbol('userId')

    it('updates user keys with value null for given user', async () => {
      query.mockResolvedValueOnce([response])

      await expect(deleteUserKeyValues(userId)).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `
        update user_keys set keyValue = null where userId = ?`,
        [userId]
      )

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if database rejects while updating user keys', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(deleteUserKeyValues(userId)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })
})
