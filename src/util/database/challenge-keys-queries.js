// eslint-disable-next-line require-await
export async function createChallengeKeys(connection, challengeKeyValues) {
  return connection.query(
    `insert into challenge_keys (keyId, challengeId, keyOrder) 
    values ?`,
    [challengeKeyValues]
  )
}
