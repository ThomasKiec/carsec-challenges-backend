import { header, param } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { deleteChallengeById } from '../../util/database/challenges-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function deleteChallengeRouter(router) {
  router.delete(
    '/:challengeId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('challengeId')
        .isInt()
        .withMessage('challengeId required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'deleteChallenge'),
    async (req, res, next) => {
      try {
        const { challengeId } = req.params

        const { affectedRows } = await deleteChallengeById(challengeId)

        res.json({
          affectedRows: {
            challenges: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'deleteChallenge' })
      }
    }
  )

  return router
}
