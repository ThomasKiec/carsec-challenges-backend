import { body, header } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { createTeam } from '../../util/database/teams-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function createTeamRouter(router) {
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

  return router
}
