import { compareSync, hash } from 'bcrypt'
import { createUserChallenges } from '../../../src/util/database/user-challenges-queries'
import { createUserKeys } from '../../../src/util/database/user-keys-queries'
import { generate } from 'generate-password'
import { getPool } from '../../../src/util/database/connection'
import { listChallenges } from '../../../src/util/database/challenges-queries'
import { listHardwareKeys } from '../../../src/util/database/hardware-keys-queries'
import {
  changeUserPassword,
  createUser,
  deleteUserById,
  getUserById,
  getUsersByEmail,
  listUsers,
  listUsersWithTeams,
  resetUserPassword,
} from '../../../src/util/database/user-queries'

jest.mock('../../../src/util/database/connection')
jest.mock('bcrypt')
jest.mock('../../../src/util/database/user-challenges-queries')
jest.mock('../../../src/util/database/user-keys-queries')
jest.mock('../../../src/util/database/challenges-queries')
jest.mock('../../../src/util/database/hardware-keys-queries')
jest.mock('generate-password')

describe('user-queries', () => {
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

    createUserChallenges.mockReset()
    createUserKeys.mockReset()
    listChallenges.mockReset()
    listHardwareKeys.mockReset()

    compareSync.mockReset()
    hash.mockReset()
    generate.mockReset()
  })

  describe('listUsersWithTeams', () => {
    it('resovles list of users with teams', async () => {
      query.mockResolvedValueOnce(response)

      await expect(listUsersWithTeams()).resolves.toBe(response)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`
  select u.id, u.role, u.email, t.name team
  from users u
  left join teams t on u.teamId = t.id
  order by t.name, u.id`)
    })

    it('throws error if database rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listUsersWithTeams()).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`
  select u.id, u.role, u.email, t.name team
  from users u
  left join teams t on u.teamId = t.id
  order by t.name, u.id`)
    })
  })

  describe('listUsers', () => {
    it('resolves with list of users', async () => {
      query.mockResolvedValueOnce(response)

      await expect(listUsers()).resolves.toEqual(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from users')
    })

    it('throws error if database rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(listUsers()).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from users')
    })
  })

  describe('getUserById', () => {
    const userId = Symbol('userId')

    it('resolves with user found by id', async () => {
      query.mockResolvedValueOnce(response)

      await expect(getUserById(userId)).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from users where id = ?', [userId])
    })

    it('throws error if database rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(getUserById(userId)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('getUsersByEmail', () => {
    const email = Symbol('email')

    it('resolves with user found by id', async () => {
      query.mockResolvedValueOnce(response)

      await expect(getUsersByEmail(email)).resolves.toBe(response)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `
  select u.*, t.name team
  from users u 
  left join teams t on u.teamId = t.id
  where email = ?`,
        [email]
      )
    })

    it('throws error if database rejects', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(getUsersByEmail(email)).rejects.toThrow(error)

      expect(query).toHaveBeenCalledTimes(1)
    })
  })

  describe('createUser', () => {
    const email = Symbol('email')
    const passwordHash = Symbol('passwordHash')
    const teamId = Symbol('teamId')
    const role = Symbol('role')

    const insertId = Symbol('insertId')
    const firstKey = Symbol('firstKey')
    const secondKey = Symbol('secondKey')

    const firstChallenge = Symbol('firstChallenge')
    const secondChallenge = Symbol('secondChallenge')

    it('creates user if it not already exists', async () => {
      query.mockResolvedValueOnce([{ insertId }])
      listHardwareKeys.mockResolvedValueOnce([[{ id: firstKey }, { id: secondKey }]])
      listChallenges.mockResolvedValueOnce([[{ id: firstChallenge }, { id: secondChallenge }]])

      await expect(createUser(email, passwordHash, teamId, role)).resolves.toBe(insertId)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('insert into users (teamId, role, email, password) values( ?, ?, ?, ?)', [
        teamId,
        role,
        email,
        passwordHash,
      ])

      expect(listHardwareKeys).toHaveBeenCalledTimes(1)

      expect(createUserKeys).toHaveBeenCalledTimes(1)
      expect(createUserKeys).toHaveBeenCalledWith(connection, [[firstKey, insertId], [secondKey, insertId]])

      expect(listChallenges).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).toHaveBeenCalledTimes(1)
      expect(createUserChallenges).toHaveBeenCalledWith(connection, [
        [insertId, firstChallenge],
        [insertId, secondChallenge],
      ])

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws if createUserChallenges fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([{ insertId }])
      listHardwareKeys.mockResolvedValueOnce([[{ id: firstKey }, { id: secondKey }]])
      listChallenges.mockResolvedValueOnce([[{ id: firstChallenge }, { id: secondChallenge }]])

      createUserChallenges.mockRejectedValueOnce(error)

      await expect(createUser(email, passwordHash, teamId, role)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('insert into users (teamId, role, email, password) values( ?, ?, ?, ?)', [
        teamId,
        role,
        email,
        passwordHash,
      ])

      expect(listHardwareKeys).toHaveBeenCalledTimes(1)

      expect(createUserKeys).toHaveBeenCalledTimes(1)
      expect(createUserKeys).toHaveBeenCalledWith(connection, [[firstKey, insertId], [secondKey, insertId]])

      expect(listChallenges).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).toHaveBeenCalledTimes(1)
      expect(createUserChallenges).toHaveBeenCalledWith(connection, [
        [insertId, firstChallenge],
        [insertId, secondChallenge],
      ])

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })

    it('throws if listChallenges fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([{ insertId }])
      listHardwareKeys.mockResolvedValueOnce([[{ id: firstKey }, { id: secondKey }]])
      listChallenges.mockRejectedValueOnce(error)

      await expect(createUser(email, passwordHash, teamId, role)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('insert into users (teamId, role, email, password) values( ?, ?, ?, ?)', [
        teamId,
        role,
        email,
        passwordHash,
      ])

      expect(listHardwareKeys).toHaveBeenCalledTimes(1)

      expect(createUserKeys).toHaveBeenCalledTimes(1)
      expect(createUserKeys).toHaveBeenCalledWith(connection, [[firstKey, insertId], [secondKey, insertId]])

      expect(listChallenges).toHaveBeenCalledTimes(1)

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    it('throws if listHardwareKeys fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([{ insertId }])
      listHardwareKeys.mockRejectedValueOnce(error)

      await expect(createUser(email, passwordHash, teamId, role)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('insert into users (teamId, role, email, password) values( ?, ?, ?, ?)', [
        teamId,
        role,
        email,
        passwordHash,
      ])

      expect(listHardwareKeys).toHaveBeenCalledTimes(1)

      expect(createUserKeys).not.toHaveBeenCalled()
      expect(listChallenges).not.toHaveBeenCalled()

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    it('throws if database rejects while insert user', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockRejectedValueOnce(error)

      await expect(createUser(email, passwordHash, teamId, role)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('insert into users (teamId, role, email, password) values( ?, ?, ?, ?)', [
        teamId,
        role,
        email,
        passwordHash,
      ])

      expect(listHardwareKeys).not.toHaveBeenCalled()

      expect(createUserKeys).not.toHaveBeenCalled()
      expect(listChallenges).not.toHaveBeenCalled()

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(createUserChallenges).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('changeUserPassword', () => {
    const userId = Symbol('userId')
    const password = 'password'
    const wrongPassword = 'wrongPassword'

    const oldPassword = Symbol('oldPassword')
    const passwordHash = Symbol('passwordHash')
    const updatedPasswordHash = Symbol('updatedPasswordHash')

    const user = { password: passwordHash }

    it('updates users password if old password matches with saved password', async () => {
      query.mockResolvedValueOnce([[user]]).mockResolvedValueOnce([response])
      compareSync.mockResolvedValueOnce(true)
      hash.mockResolvedValueOnce(updatedPasswordHash)

      await expect(changeUserPassword(userId, password, password, oldPassword)).resolves.toBe(response)

      expect(getPool).toHaveBeenCalledTimes(2)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from users where id = ?', [userId])
      expect(query).toHaveBeenNthCalledWith(
        2,
        `update users
          set password = ?
          where id = ?`,
        [updatedPasswordHash, userId]
      )

      expect(compareSync).toHaveBeenCalledTimes(1)
      expect(compareSync).toHaveBeenCalledWith(oldPassword, passwordHash)

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if update user password fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      query.mockResolvedValueOnce([[user]]).mockRejectedValueOnce(error)
      compareSync.mockResolvedValueOnce(true)
      hash.mockResolvedValueOnce(updatedPasswordHash)

      await expect(changeUserPassword(userId, password, password, oldPassword)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(2)
      expect(query).toHaveBeenNthCalledWith(1, 'select * from users where id = ?', [userId])
      expect(query).toHaveBeenNthCalledWith(
        2,
        `update users
          set password = ?
          where id = ?`,
        [updatedPasswordHash, userId]
      )

      expect(compareSync).toHaveBeenCalledTimes(1)
      expect(compareSync).toHaveBeenCalledWith(oldPassword, passwordHash)

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })

    it('throws error if stored password do not match with given password', async () => {
      const error = new Error('Old password incorrect')

      query.mockResolvedValueOnce([[user]]).mockRejectedValueOnce(error)
      compareSync.mockResolvedValueOnce(false)

      await expect(changeUserPassword(userId, password, password, oldPassword)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(2)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith('select * from users where id = ?', [userId])

      expect(compareSync).toHaveBeenCalledTimes(1)
      expect(compareSync).toHaveBeenCalledWith(oldPassword, passwordHash)

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })

    it('throws error if new passwords do not match', async () => {
      const error = new Error('New passwords do not match')

      query.mockResolvedValueOnce([[user]]).mockRejectedValueOnce(error)
      compareSync.mockResolvedValueOnce(false)

      await expect(changeUserPassword(userId, password, wrongPassword, oldPassword)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).not.toHaveBeenCalled()

      expect(compareSync).not.toHaveBeenCalled()

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('resetUserPassword', () => {
    const userId = Symbol('userId')

    const generatedPassword = Symbol('generatedPassword')
    const passwordHash = Symbol('passwordHash')

    it('resets password for user by given userId', async () => {
      generate.mockReturnValueOnce(generatedPassword)
      hash.mockResolvedValueOnce(passwordHash)
      query.mockResolvedValueOnce([response])

      await expect(resetUserPassword(userId)).resolves.toEqual({ password: generatedPassword, user: response })

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(generate).toHaveBeenCalledTimes(1)
      expect(generate).toHaveBeenCalledWith({ length: 10, numbers: true })

      expect(hash).toHaveBeenCalledTimes(1)
      expect(hash).toHaveBeenCalledWith(generatedPassword, 10)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `update users
          set password = ?
          where id = ?`,
        [passwordHash, userId]
      )

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('throws error if update user password fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')
      generate.mockReturnValueOnce(generatedPassword)
      hash.mockResolvedValueOnce(passwordHash)
      query.mockRejectedValueOnce(error)

      await expect(resetUserPassword(userId)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(generate).toHaveBeenCalledTimes(1)
      expect(generate).toHaveBeenCalledWith({ length: 10, numbers: true })

      expect(hash).toHaveBeenCalledTimes(1)
      expect(hash).toHaveBeenCalledWith(generatedPassword, 10)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(
        `update users
          set password = ?
          where id = ?`,
        [passwordHash, userId]
      )

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })

    it('throws error if generate password fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      generate.mockImplementationOnce(() => {
        throw error
      })

      await expect(resetUserPassword(userId)).rejects.toThrow(error)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(generate).toHaveBeenCalledTimes(1)
      expect(generate).toHaveBeenCalledWith({ length: 10, numbers: true })

      expect(hash).not.toHaveBeenCalled()

      expect(query).not.toHaveBeenCalled()

      expect(rollback).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('deleteUserById', () => {
    it('deletes single user if only one user given', async () => {
      const userId = 1

      query.mockResolvedValueOnce([response])

      await expect(deleteUserById(userId)).resolves.toBe(response)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`delete from users where id in (${userId})`)

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })

    it('deletes multiple users', async () => {
      const userIds = [1, 2, 3]
      const queryParameters = '1,2,3'

      query.mockResolvedValueOnce([response])

      await expect(deleteUserById(userIds)).resolves.toBe(response)

      expect(getPool).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
      expect(beginTransaction).toHaveBeenCalledTimes(1)

      expect(query).toHaveBeenCalledTimes(1)
      expect(query).toHaveBeenCalledWith(`delete from users where id in (${queryParameters})`)

      expect(commit).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)

      expect(rollback).not.toHaveBeenCalled()
    })
  })
})
