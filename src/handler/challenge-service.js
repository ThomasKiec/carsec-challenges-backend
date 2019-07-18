import { body, header, param } from 'express-validator/check'
import { createChallenge, deleteChallengeById, listChallenges } from '../util/database/challenges-queries'
import { jwtAdmin, jwtUser } from '../lib/passport/initialize'
import { Router } from 'express'
import { authorizeUser } from '../middlewares/authorize-user'
import { handleValidationResultError } from '../middlewares/handle-validation-result-error'

export function challengeService() {
  const router = Router()

  router.get(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'listChallenges'),
    async (req, res, next) => {
      try {
        const { id: userId } = res.user
        const [challenges] = await listChallenges(userId)

        return res.json({ challenges })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listChallenges' })
      }
    }
  )

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

  router.delete(
    '/:challengeId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('challengeId')
        .isInt()
        .withMessage('challengeId required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'deleteChallenge'),
    async (req, res, next) => {
      const { challengeId } = req.params

      try {
        const { affectedRows } = await deleteChallengeById(challengeId)

        res.json({
          affectedRows: {
            challenges: affectedRows,
          },
        })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'deleteChallenge' })
      }
    }
  )

  return router
}
