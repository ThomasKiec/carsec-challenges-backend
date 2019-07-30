import { Router } from 'express'
import { createHardwareKeyRouter } from './create-hardware-key'
import { deleteHardwareKeyRouter } from './delete-hardware-key'
import { deleteUserKeyValuesRouter } from './delete-user-key-values'
import { getHardwareKeysRouter } from './get-hardware-keys'
import { getUserKeysRouter } from './get-user-keys'
import { updateUserKeyRouter } from './update-user-key'

export function hardwareKeysService() {
  const router = Router()

  createHardwareKeyRouter(router)
  deleteHardwareKeyRouter(router)
  getHardwareKeysRouter(router)

  getUserKeysRouter(router)
  updateUserKeyRouter(router)
  deleteUserKeyValuesRouter(router)

  return router
}
