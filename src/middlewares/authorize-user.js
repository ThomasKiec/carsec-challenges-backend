import { authenticate } from 'passport'
import { jwtUser } from '../lib/passport/initialize'

export function authorizeUser(req, res, next, strategy) {
  return authenticate(strategy, { session: false }, (error, user, info) => {
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
