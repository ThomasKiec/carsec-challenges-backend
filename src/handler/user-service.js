import { body, header, param, query } from 'express-validator/check'
import {
  changeUserPassword,
  deleteUserById,
  getUserById,
  listUsersWithTeams,
  resetUserPassword,
} from '../util/database/user-queries'
import { jwtAdmin, jwtUser } from '../lib/passport/initialize'
import PasswordValidator from 'password-validator'
import { Router } from 'express'
import { authorizeUser } from '../middlewares/authorize-user'
import { handleValidationResultError } from '../middlewares/handle-validation-result-error'
import passport from 'passport'
import passwordGenerator from 'generate-password'
import { sendPasswordResetEmail } from '../util/mailer'

export function userService() {
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

  router.get(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'listUsers'),
    async (req, res, next) => {
      try {
        const [users] = await listUsersWithTeams()

        return res.json({ users })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listUsers' })
      }
    }
  )

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
        const { id: userId } = req.user

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
        console.log(error)
        res.status(400).json({ message: error.message, type: 'resetUser' })
      }
    }
  )

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
