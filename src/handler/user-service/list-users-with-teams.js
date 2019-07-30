import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { header } from 'express-validator/check'
import { jwtAdmin } from '../../lib/passport/initialize'
import { listUsersWithTeams } from '../../util/database/user-queries'

export function listUsersWithTeamsRouter(router) {
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

  return router
}
