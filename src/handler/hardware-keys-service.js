import { body, header, param } from 'express-validator/check'
import { createHardwareKey, deleteHardwareKey, listHardwareKeys } from '../util/database/hardware-keys-queries'
import { getUserKeys, updateUserKey } from '../util/database/user-keys-queries'
import { jwtAdmin, jwtUser } from '../lib/passport/initialize'
import { Router } from 'express'
import { authorizeUser } from '../middlewares/authorize-user'
import { handleValidationResultError } from '../middlewares/handle-validation-result-error'

export function hardwareKeysService() {
  const router = Router()

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

  router.get(
    '/user',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'listUserKeys'),
    async (req, res, next) => {
      try {
        const { id: userId } = res.userId
        const [userKeys] = await getUserKeys(userId)

        return res.json({ userKeys })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'listUserKeyss' })
      }
    }
  )

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

  router.put(
    '/user',
    [
      header('Authorization')
        .exists()
        .withMessage('Authorization header is required'),
      body('keys')
        .exists()
        .withMessage('Parameter keyValue is required'),
    ],
    (req, res, next) => authorizeUser(req, res, next, jwtUser),
    (req, res, next) => handleValidationResultError(req, res, next, 'updateUserKey'),
    async (req, res, next) => {
      try {
        const { keys } = req.body
        const [{ affectedRows }] = await updateUserKey(keys)

        res.json({ affectedRows: { userKeys: affectedRows } })
      } catch (error) {
        res.status(400).json({ message: error.message, type: 'UpdateUserKey' })
      }
    }
  )

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
