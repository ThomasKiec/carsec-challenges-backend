import { Router } from 'express'
import { changeUserPasswordRouter } from './change-user-password'
import { deleteUserByIdRouter } from './delete-user'
import { listUsersWithTeamsRouter } from './list-users-with-teams'
import { resetUserPasswordRouter } from './reset-user-password'
import { userSigninRouter } from './user-signin'
import { userSignupRouter } from './user-signup'

export function userService() {
  const router = Router()

  userSignupRouter(router)
  userSigninRouter(router)
  deleteUserByIdRouter(router)

  changeUserPasswordRouter(router)
  resetUserPasswordRouter(router)

  listUsersWithTeamsRouter(router)

  return router
}
