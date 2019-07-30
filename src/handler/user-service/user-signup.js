import { body, header } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'
import passport from 'passport'
import passwordGenerator from 'generate-password'

export function userSignupRouter(router) {
  router.post(
    '/signup',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('email')
        .isEmail()
        .withMessage('Invalid email adress'),
      body('teamId')
        .isInt()
        .withMessage('Parameter teamId is required'),
      body('role')
        .matches(/\b(?:admin|student)\b/)
        .withMessage('Invalid role, should be one of [admin, student]'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'signupMessage'),
    (req, res, next) => {
      const password = passwordGenerator.generate({ length: 10, numbers: true })

      req.body.password = password

      next()
    },
    (req, res, next) =>
      passport.authenticate('local-signup', { session: false }, async (error, user, info) => {
        if (error) {
          return res.status(400).json({ message: error.message, type: 'signupMessage' })
        }

        if (user) {
          return res.json({ user: user })
        }

        return res.status(400).json({ message: info, type: 'signupMessage' })
      })(req, res, next)
  )

  return router
}
