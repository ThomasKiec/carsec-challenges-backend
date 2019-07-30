import { Router } from 'express'
import { createChallengeRouter } from './create-challenge'
import { deleteChallengeRouter } from './delete-challenge'
import { listUserChallengesRouter } from './list-user-challenges'

export function challengeService() {
  const router = Router()

  createChallengeRouter(router)
  deleteChallengeRouter(router)
  listUserChallengesRouter(router)

  return router
}
