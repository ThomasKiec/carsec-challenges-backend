import BlobStore from 'scalable-blob-store'
import fs from 'fs'
import shell from 'shelljs'
import uuid from 'uuid'

const options = {
  blobStoreRoot: '/',
  dirDepth: 3,
  dirWidth: 10000,
  idFunction: uuid.v4,
}

const blobStore = new BlobStore(options)

// eslint-disable-next-line require-await
export async function buildUserChallenge(userId, challengeId, challengeData) {
  const { buildCall, ...hardwareKeys } = challengeData

  let challengeBuild = buildCall

  for (const { keyValue } of Object.values(hardwareKeys)) {
    challengeBuild += ` ${keyValue}`
  }

  return shell.exec(challengeBuild, async (challengePath, challengeResult) => {
    const readStream = fs.createReadStream(challengePath)
    let store
    try {
      const filePath = `${userId}/${challengeId}`
      await blobStore.setCurrentBlobDir(filePath)

      store = await blobStore.createWriteStream()

      return new Promise((resolve, reject) => {
        store.writeStream.on('finish', () => {
          resolve({ challengeResult, filePath })
        })

        store.writeStream.on('error', reject)

        readStream.pipe(store.writeStream)
      })
    } catch (error) {
      throw error
    }
  })
}
