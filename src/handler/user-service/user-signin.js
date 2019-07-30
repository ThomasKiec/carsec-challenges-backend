import { body } from 'express-validator/check'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import passport from 'passport'

export function userSigninRouter(router) {
  router.post(
    '/signin',
    [
      body('email')
        .isEmail()
        .withMessage('Invalid email adress'),
      body('password')
        .exists()
        .withMessage('Parameter password is required'),
    ],
    (req, res, next) => handleValidationResultError(req, res, next, 'login'),
    (req, res, next) =>
      passport.authenticate('local-login', { session: false }, (error, user, info) => {
        if (error) {
          return next(error)
        }

        if (user) {
          return res.json(user)
        }

        return res.status(400).json(info)
      })(req, res, next)
  )

  return router
}
