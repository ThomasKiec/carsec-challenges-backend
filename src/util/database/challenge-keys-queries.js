// eslint-disable-next-line require-await
export async function createChallengeKey(connection, keyId, challengeId, keyOrder) {
  return connection.query(
    `insert into challenge_keys (keyId, challengeId, keyOrder) 
  values(?, ?, ?)`,
    [keyId, challengeId, keyOrder]
  )
}
