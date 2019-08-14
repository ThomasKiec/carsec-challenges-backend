import { createPool } from 'mysql2/promise'
import { getPool } from '../../../src/util/database/connection'

jest.mock('mysql2/promise', () => ({ createPool: jest.fn() }))

describe('connection', () => {
  const database = 'database'
  const host = 'host'
  const password = 'password'
  const port = 'port'
  const user = 'user'

  const pool = Symbol('pool')

  beforeAll(() => {
    process.env.DB_DATABASE = database
    process.env.DB_HOST = host
    process.env.DB_PASSWORD = password
    process.env.DB_PORT = port
    process.env.DB_USER = user
  })

  afterEach(() => {
    createPool.mockReset()
  })

  afterAll(() => {
    delete process.env.DB_DATABASE
    delete process.env.DB_HOST
    delete process.env.DB_PASSWORD
    delete process.env.DB_PORT
    delete process.env.DB_USER
  })

  it('throws error if createPool rejects', async () => {
    const error = new Error(' ¯\\_(ツ)_/¯')

    createPool.mockRejectedValueOnce(error)

    await expect(getPool()).rejects.toThrow(error)

    expect(createPool).toHaveBeenCalledTimes(1)
    expect(createPool).toHaveBeenCalledWith({
      database,
      host,
      password,
      port,
      user,
    })
  })

  it('resolves created pool if no pool created before', async () => {
    createPool.mockResolvedValueOnce(pool)

    await expect(getPool()).resolves.toEqual(pool)

    expect(createPool).toHaveBeenCalledTimes(1)
    expect(createPool).toHaveBeenCalledWith({
      database,
      host,
      password,
      port,
      user,
    })
  })

  it('resolves cached pool if poll has been created before', async () => {
    await expect(getPool()).resolves.toEqual(pool)

    expect(createPool).not.toHaveBeenCalled()
  })
})
