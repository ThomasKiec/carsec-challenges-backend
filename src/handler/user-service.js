import { body, header } from 'express-validator/check'
import { Router } from 'express'
import { authorizeUser } from '../middlewares/authorize-user'
import { handleValidationResultError } from '../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../lib/passport/initialize'
import passport from 'passport'
import passwordValidator from 'password-validator'

export function userService() {
  const passwordSchema = new passwordValidator()

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

  const router = Router()

  router.post(
    '/signup',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('email')
        .isEmail()
        .withMessage('Invalid email adress'),
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
      body('role')
        .matches(/\b(?:admin|student)\b/)
        .withMessage('Invalid role, should be one of [admin, student]'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'signupMessage'),
    (req, res, next) =>
      passport.authenticate('local-signup', { session: false }, (error, user, info) => {
        if (error) {
          return next(error)
        }

        if (user) {
          return res.json({ user: user })
        }

        return res.status(400).json(info)
      })(req, res, next)
  )

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
    (req, res, next) => handleValidationResultError(req, res, next, 'loginMessage'),
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
