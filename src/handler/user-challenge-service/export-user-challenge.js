import { header, param } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtUser } from '../../lib/passport/initialize'
import { readUserChallenge } from '../../util/challenges/read-user-challenge'

export function exportUserChallengeRouter(router) {
  router.get(
    '/:challengeId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('challengeId')
        .isInt()
        .withMessage('Parameter challengeId is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'downloadUserChallenge'),
    async (req, res, next) => {
      const { challengeId } = req.params
      const { id: userId } = res.user

      try {
        const challenge = await readUserChallenge(userId, challengeId)

        res.download(challenge)
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'downloadUserChallenge' })
      }
    }
  )

  return router
}
