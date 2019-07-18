import { jwtUser } from '../lib/passport/initialize'
import passport from 'passport'

export function authorizeUser(req, res, next, strategy) {
  return passport.authenticate(strategy, { session: false }, (error, user, info) => {
    if (error) {
      return next(error)
    }

    if (user) {
      if (strategy === jwtUser) {
        res.user = user
      }
      return next()
    }

    res.status(401).json({ message: info.message, type: info.type })
  })(req, res, next)
}
