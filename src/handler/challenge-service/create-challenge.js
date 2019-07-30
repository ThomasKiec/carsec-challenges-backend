import { body, header } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { createChallenge } from '../../util/database/challenges-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function createChallengeRouter(router) {
  router.post(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('project')
        .exists()
        .withMessage('Parameter project is required'),
      body('title')
        .exists()
        .withMessage('Parameter title is required'),
      body('points')
        .exists()
        .withMessage('Parameter points is required'),
      body('topic')
        .exists()
        .withMessage('Parameter topic is required'),
      body('buildCall')
        .exists()
        .withMessage('Parameter buildCall is required'),
      body('description')
        .exists()
        .withMessage('Parameter description is required'),
      body('challengeKeys')
        .exists()
        .withMessage('Parameter challengeKeys is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'createChallenge'),
    async (req, res, next) => {
      const { project, title, points, topic, buildCall, description, challengeKeys } = req.body
      try {
        const challenge = await createChallenge(project, title, points, topic, buildCall, description, challengeKeys)

        return res.json({ challenge })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'createChallenge' })
      }
    }
  )

  return router
}
