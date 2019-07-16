// eslint-disable-next-line require-await
export async function buildUserChallenge(userId, challengeId) {
  const filePath = 'someFilePath'
  const challengeResult = 'someResult'

  // return Promise.resolve({ challengeResult, filePath })

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ challengeResult, filePath })
    }, 10000)
  })
}
