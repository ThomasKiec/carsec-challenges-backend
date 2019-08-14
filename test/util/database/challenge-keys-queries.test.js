import { createChallengeKeys } from '../../../src/util/database/challenge-keys-queries'

describe('challenge-keys-queries', () => {
  const connection = {
    query: jest.fn(),
  }

  const challengeKeyValues = Symbol('challengeKeyValues')

  afterEach(() => {
    connection.query.mockReset()
  })

  it('queries via given connection', async () => {
    const queryResult = Symbol('queryResult')

    connection.query.mockResolvedValueOnce(queryResult)

    await expect(createChallengeKeys(connection, challengeKeyValues)).resolves.toEqual(queryResult)

    expect(connection.query).toHaveBeenCalledTimes(1)
    expect(connection.query).toHaveBeenCalledWith(
      `insert into challenge_keys (keyId, challengeId, keyOrder) 
    values ?`,
      [challengeKeyValues]
    )
  })

  it('throws error if query rejects', async () => {
    const error = new Error(' ¯\\_(ツ)_/¯')

    connection.query.mockRejectedValueOnce(error)

    await expect(createChallengeKeys(connection, challengeKeyValues)).rejects.toThrow(error)

    expect(connection.query).toHaveBeenCalledTimes(1)
    expect(connection.query).toHaveBeenCalledWith(
      `insert into challenge_keys (keyId, challengeId, keyOrder) 
    values ?`,
      [challengeKeyValues]
    )
  })
})
