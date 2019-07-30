import { body, header } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtUser } from '../../lib/passport/initialize'
import { updateUserKey } from '../../util/database/user-keys-queries'

export function updateUserKeyRouter(router) {
  router.put(
    '/user',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('userKeys')
        .exists()
        .custom(userKeys => Array.isArray(userKeys) && userKeys.length)
        .withMessage('Parameter keyValue is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'updateUserKey'),
    async (req, res, next) => {
      try {
        const { userKeys } = req.body
        const { id: userId } = res.user

        const [{ affectedRows }] = await updateUserKey(userKeys, userId)

        res.json({ affectedRows: { userKeys: affectedRows } })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'updateUserKey' })
      }
    }
  )

  return router
}
