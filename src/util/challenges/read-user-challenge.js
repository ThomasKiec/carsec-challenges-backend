import BlobStore from 'scalable-blob-store'
import uuid from 'uuid'

const options = {
  blobStoreRoot: '/',
  dirDepth: 3,
  dirWidth: 10000,
  idFunction: uuid.v4,
}

const blobStore = new BlobStore(options)

export async function readUserChallenge(userId, challengeId) {
  try {
    const blobPath = `/${userId}/${challengeId}`

    const challenge = await blobStore.read(blobPath)

    return challenge
  } catch (error) {
    throw error
  }
}
