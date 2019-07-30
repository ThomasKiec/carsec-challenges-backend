import { body, header } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { createHardwareKey } from '../../util/database/hardware-keys-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function createHardwareKeyRouter(router) {
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
    (req, res, next) => handleValidationResultError(req, res, next, 'createHardwareKey'),
    async (req, res, next) => {
      try {
        const { name } = req.body
        const hardwareKey = await createHardwareKey(name)

        return res.json({ hardwareKey })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'createHardwareKey' })
      }
    }
  )

  return router
}
