// eslint-disable-next-line require-await
export async function createChallengeKey(connection, keyId, challengeId) {
  return connection.query('insert into challenge_keys(keyId, challengeId) values(?, ?)', [keyId, challengeId])
}
