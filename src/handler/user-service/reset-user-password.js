import { getUserById, resetUserPassword } from '../../util/database/user-queries'
import { header, param } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'
import { sendPasswordResetEmail } from '../../util/mailer'

export function resetUserPasswordRouter(router) {
  router.put(
    '/reset/:userId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('userId')
        .isInt()
        .withMessage('Parameter userId is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'resetUser'),
    async (req, res, next) => {
      const { userId } = req.params

      try {
        const {
          user: { affectedRows },
          password,
        } = await resetUserPassword(userId)

        const [[user]] = await getUserById(userId)

        if (user) {
          const { email } = user

          await sendPasswordResetEmail(email, password)
        }

        res.json({
          affectedRows: {
            users: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'resetUser' })
      }
    }
  )

  return router
}
