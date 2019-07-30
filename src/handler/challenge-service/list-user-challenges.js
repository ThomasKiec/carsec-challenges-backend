import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { header } from 'express-validator/check'
import { jwtUser } from '../../lib/passport/initialize'
import { listUserChallenges } from '../../util/database/challenges-queries'

export function listUserChallengesRouter(router) {
  router.get(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'listChallenges'),
    async (req, res, next) => {
      try {
        const { id: userId } = res.user
        const [challenges] = await listUserChallenges(userId)

        return res.json({ challenges })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listChallenges' })
      }
    }
  )

  return router
}
