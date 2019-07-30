import { body, header } from 'express-validator/check'
import PasswordValidator from 'password-validator'
import { authorizeUser } from '../../middlewares/authorize-user'
import { changeUserPassword } from '../../util/database/user-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtUser } from '../../lib/passport/initialize'

export function changeUserPasswordRouter(router) {
  const passwordSchema = new PasswordValidator()

  passwordSchema
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .not()
    .spaces()

  router.put(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('password')
        .custom(password => {
          const errors = passwordSchema.validate(password, { list: true })
          if (errors.length) {
            throw new Error(`Password is not strong enough: ${errors.toString()}`)
          }
          return true
        })
        .exists()
        .withMessage('Parameter password is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'changePassword'),
    async (req, res, next) => {
      try {
        const { password } = req.body
        const { id: userId } = res.user

        const { affectedRows } = await changeUserPassword(userId, password)

        res.json({
          affectedRows: {
            users: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'changePassword' })
      }
    }
  )

  return router
}
