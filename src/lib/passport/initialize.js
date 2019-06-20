import {
  getJWTAdminAuthenticationStrategy,
  getJWTUserAuthenticationStrategy,
  getLoginStrategy,
  getSignupStrategy,
} from './local-strategies'
import passport from 'passport'

export const jwtAdmin = 'jwt-admin'
export const jwtUser = 'jwt-user'

export function initializePassportStrategies() {
  passport.use('local-signup', getSignupStrategy())
  passport.use('local-login', getLoginStrategy())
  passport.use(jwtUser, getJWTUserAuthenticationStrategy())
  passport.use(jwtAdmin, getJWTAdminAuthenticationStrategy())
}
