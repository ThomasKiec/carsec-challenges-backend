import { Router } from 'express'
import { exportUserChallengeRouter } from './export-user-challenge'
import { solveUserChallengeRouter } from './solve-user-challenge'

export function userChallengeService() {
  const router = Router()

  exportUserChallengeRouter(router)
  solveUserChallengeRouter(router)

  return router
}
