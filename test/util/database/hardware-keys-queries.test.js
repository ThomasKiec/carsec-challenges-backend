import {
  createHardwareKey,
  deleteHardwareKey,
  listHardwareKeys,
} from '../../../src/util/database/hardware-keys-queries'
import { createUserKeys } from '../../../src/util/database/user-keys-queries'
import { getPool } from '../../../src/util/database/connection'
import { listUsers } from '../../../src/util/database/user-queries'

jest.mock('../../../src/util/database/user-keys-queries')
jest.mock('../../../src/util/database/connection')
jest.mock('../../../src/util/database/user-queries')

describe('hardware-keys-queries', () => {
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

    createUserKeys.mockReset()
    listUsers.mockReset()
  })

  describe('createHardwareKey', () => {
    const hardwareKeyName = 'hardwareKey name'
    const hardwareKey = Symbol('hardwareKey')
    const insertId = Symbol('insertId')

    const users = [{ id: 1 }, { id: 2 }]

    it('creates new hardware key and user keys for all users', async () => {
      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId }])
      listUsers.mockResolvedValueOnce([users])

      await expect(createHardwareKey(hardwareKeyName)).resolves.toEqual({ insertId })

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from hardware_keys where name = ?', [hardwareKeyName])
      expect(query).toHaveBeenCalledTimes(2, 'insert into hardware_keys (name) values(?)', [hardwareKeyName])

      expect(listUsers).toHaveBeenCalledTimes(1)

      expect(createUserKeys).toHaveBeenCalledTimes(1)
      expect(createUserKeys).toHaveBeenCalledWith(connection, [[insertId, users[0].id], [insertId, users[1].id]])

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if getHardwareKeyByName rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(createHardwareKey(hardwareKeyName)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(listUsers).not.toHaveBeenCalled()
      expect(createUserKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    it('throws if listUsers rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId }])
      listUsers.mockRejectedValueOnce(error)

      await expect(createHardwareKey(hardwareKeyName)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(2)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
      expect(listUsers).toHaveBeenCalledTimes(1)

      expect(createUserKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    it('throws error if insert hardware key rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockRejectedValueOnce(error)

      await expect(createHardwareKey(hardwareKeyName)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(2)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(listUsers).not.toHaveBeenCalled()
      expect(createUserKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    it('throws if createUserKeys rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId }])
      listUsers.mockResolvedValueOnce([users])

      createUserKeys.mockRejectedValueOnce(error)

      await expect(createHardwareKey(hardwareKeyName)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(2)

      expect(beginTransaction).toHaveBeenCalledTimes(1)
      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
      expect(listUsers).toHaveBeenCalledTimes(1)
      expect(createUserKeys).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })

    it('throws with error message if hardware key already exists', async () => {
      const error = new Error(`Hardware key with name: "${hardwareKeyName}" already exists`)
      query.mockResolvedValueOnce([[hardwareKey]])

      await expect(createHardwareKey(hardwareKeyName)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(listUsers).not.toHaveBeenCalled()
      expect(createUserKeys).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('deleteHardwareKey', () => {
    const hardwareKeyId = Symbol('hardwareKeyId')

    it('deletes hardware key by id', async () => {
      const deletedHardwareKey = Symbol('deletedHardwareKey')

      query.mockResolvedValueOnce(deletedHardwareKey)

      await expect(deleteHardwareKey(hardwareKeyId)).resolves.toBe(deletedHardwareKey)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('delete from hardware_keys where id = ?', [hardwareKeyId])

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws if function rejects while deleting hardware key', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(deleteHardwareKey(hardwareKeyId)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('delete from hardware_keys where id = ?', [hardwareKeyId])

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('listHardwareKeys', () => {
    it('resolves list of hardware keys', async () => {
      const hardwareKeysList = Symbol('hardwareKeysList')

      query.mockResolvedValueOnce(hardwareKeysList)

      await expect(listHardwareKeys()).resolves.toBe(hardwareKeysList)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`
  select id, name 
  from hardware_keys 
  order by name`)
    })

    it('throws if query rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listHardwareKeys()).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`
  select id, name 
  from hardware_keys 
  order by name`)
    })
  })
})
