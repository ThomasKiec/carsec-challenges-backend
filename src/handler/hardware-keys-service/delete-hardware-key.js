import { header, param } from 'express-validator/check'
import { authorizeUser } from '../../middlewares/authorize-user'
import { deleteHardwareKey } from '../../util/database/hardware-keys-queries'
import { handleValidationResultError } from '../../middlewares/handle-validation-result-error'
import { jwtAdmin } from '../../lib/passport/initialize'

export function deleteHardwareKeyRouter(router) {
  router.delete(
    '/:keyId',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      param('keyId')
        .isInt()
        .withMessage('keyId required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtAdmin),
    (req, res, next) => handleValidationResultError(req, res, next, 'deleteHardwareKey'),
    async (req, res, next) => {
      const { keyId } = req.params

      try {
        const [{ affectedRows }] = await deleteHardwareKey(keyId)

        res.json({ affectedRows: { hardwareKeys: affectedRows } })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'deleteHardwareKey' })
      }
    }
  )

  return router
}
