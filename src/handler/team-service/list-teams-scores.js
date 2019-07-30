import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { header } from 'express-validator/check'
import { jwtUser } from '../../lib/passport/initialize'
import { listTeamsScores } from '../../util/database/teams-queries'

export function listTeamsScoresRouter(router) {
  router.get(
    '/scores',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'listTeamScores'),
    async (req, res, next) => {
      try {
        const [teamScores] = await listTeamsScores()

        return res.json({ teamScores })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listTeamScores' })
      }
    }
  )
}
