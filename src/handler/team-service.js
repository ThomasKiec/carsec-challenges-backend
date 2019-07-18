import { body, header, param } from 'express-validator/check'
import { createTeam, deleteTeam, listTeams } from '../util/database/teams-queries'
import { Router } from 'express'
import { authorizeUser } from '../middlewares/authorize-user'
import { handleValidationResultError } from '../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../lib/passport/initialize'

export function teamService() {
  const router = Router()

  router.get(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'listTeams'),
    async (req, res, next) => {
      try {
        const [teams] = await listTeams()

        return res.json({ teams })
      } catch (error) {
        res.status(400).json(error)
      }
    }
  )

  router.post(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('name')
        .exists()
        .withMessage('Parameter name is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'createTeam'),
    async (req, res, next) => {
      const { name } = req.body
      try {
        const team = await createTeam(name)

        return res.json({ team })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'createTeam' })
      }
    }
  )

  router.delete(
    '/:teamId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('teamId')
        .isInt()
        .withMessage('teamId required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'deleteTeam'),
    async (req, res, next) => {
      const { teamId } = req.params

      try {
        const [{ affectedRows }] = await deleteTeam(teamId)

        res.json({
          affectedRows: {
            teams: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'deleteTeam' })
      }
    }
  )

  return router
}
