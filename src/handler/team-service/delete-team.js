import { header, param } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { deleteTeam } from '../../util/database/teams-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function deleteTeamRouter(router) {
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
