import { authorizeUser } from '../../middlewares/authorize-user'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { header } from 'express-validator/check'
import { jwtAdmin } from '../../lib/passport/initialize'
import { listHardwareKeys } from '../../util/database/hardware-keys-queries'

export function getHardwareKeysRouter(router) {
  router.get(
    '/',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'listHardwareKeys'),
    async (req, res, next) => {
      try {
        const [hardwareKeys] = await listHardwareKeys()

        return res.json({ hardwareKeys })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listHardwareKeys' })
      }
    }
  )

  return router
}
