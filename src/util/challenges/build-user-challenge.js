// eslint-disable-next-line require-await
export async function buildUserChallenge(userId, challengeId) {
  const filePath = 'someFilePath'
  const challengeResult = 'someResult'

  return Promise.resolve({ challengeResult, filePath })
}
