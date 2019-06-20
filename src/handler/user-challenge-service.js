import { header, param } from 'express-validator/check'
import { Router } from 'express'
import { authorizeUser } from '../middlewares/authorize-user'
import { handleValidationResultError } from '../middlewares/handle-validation-result-error'
import { jwtUser } from '../lib/passport/initialize'
import { solveUserChallenge } from '../util/database/user-challenges-queries'

export function userChallengeService() {
  const router = Router()

  router.get(
    '/:challengeId/:userResult',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('challengeId')
        .isInt()
        .withMessage('challengeId required'),
      param('userResult')
        .isString()
        .withMessage('userResult required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'solveUserChallenge'),
    async (req, res, next) => {
      const { challengeId, userResult } = req.params
      const { id: userId } = res.user
      try {
        const [{ affectedRows }] = await solveUserChallenge(userId, challengeId, userResult)

        res.json({
          affectedRows: {
            userChallenges: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'solveUserChallenge' })
      }
    }
  )

  return router
}
