import { authorizeUser } from '../../middlewares/authorize-user'
import { getUserKeys } from '../../util/database/user-keys-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { header } from 'express-validator/check'
import { jwtUser } from '../../lib/passport/initialize'

export function getUserKeysRouter(router) {
  router.get(
    '/user',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'listUserKeys'),
    async (req, res, next) => {
      try {
        const { id: userId } = res.user
        const [userKeys] = await getUserKeys(userId)

        return res.json({ userKeys })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listUserKeyss' })
      }
    }
  )

  return router
}
