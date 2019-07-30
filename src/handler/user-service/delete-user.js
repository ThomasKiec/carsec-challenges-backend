import { header, query } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { deleteUserById } from '../../util/database/user-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function deleteUserByIdRouter(router) {
  router.delete(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      query('userIds')
        .exists()
        .withMessage('Parameter userIds is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'deleteUser'),
    async (req, res, next) => {
      const userIds = req.query.userIds

      try {
        const { affectedRows } = await deleteUserById(userIds)

        res.json({
          affectedRows: {
            challenges: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'deleteUser' })
      }
    }
  )

  return router
}
