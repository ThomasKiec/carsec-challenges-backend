import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { header } from 'express-validator/check'
import { jwtAdmin } from '../../lib/passport/initialize'
import { listTeams } from '../../util/database/teams-queries'

export function listTeamsRouter(router) {
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

  return router
}
