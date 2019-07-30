import { header, param } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { deleteUserKeyValues } from '../../util/database/user-keys-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function deleteUserKeyValuesRouter(router) {
  router.delete(
    '/user/:userId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('userId')
        .isInt()
        .withMessage('Parameter userId is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'deleteUserKeyValue'),
    async (req, res, next) => {
      try {
        const { userId } = req.params

        const { affectedRows } = await deleteUserKeyValues(userId)

        res.json({
          affectedRows: {
            userKeys: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'deleteUserKeyValue' })
      }
    }
  )

  return router
}
