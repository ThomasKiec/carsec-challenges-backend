import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'
import { createUser, getUserById, getUsersByEmail } from '../../util/database/user-queries'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { validateStudentEmail } from '../../util/validate-email'

export function getSignupStrategy() {
  return new LocalStrategy(
    {
      passReqToCallback: true,
      passwordField: 'password',
      usernameField: 'email',
    },
    async (req, email, password, done) => {
      try {
        if (!validateStudentEmail(email)) {
          return done(null, false, { message: 'Email does not expect student pattern: "@st."', type: 'signupMessage' })
        }

        const { role, teamId } = req.body
        const [users] = await getUsersByEmail(email)

        if (users.length) {
          return done(null, false, { message: 'That email is already taken', type: 'signupMessage' })
        } else {
          bcrypt.hash(password, 10, async (error, passwordHash) => {
            if (error) {
              throw error
            }

            const userId = await createUser(email, passwordHash, teamId, role)

            return done(null, { hasCreated: true, id: userId }, { email, password })
          })
        }
      } catch (error) {
        return done(error)
      }
    }
  )
}

export function getLoginStrategy() {
  return new LocalStrategy(
    {
      passwordField: 'password',
      usernameField: 'email',
    },
    async (loginEmail, loginPassword, done) => {
      try {
        const [[user]] = await getUsersByEmail(loginEmail)

        if (!user) {
          return done(null, false, { message: 'No user found.', type: 'loginMessage' })
        }

        const { password: passwordHash, createdAt, updatedAt, ...rest } = user

        if (!bcrypt.compareSync(loginPassword, passwordHash)) {
          return done(null, false, { message: 'Incorrect password.', type: 'loginMessage' })
        }

        const token = sign(rest, process.env.JWT_SECRET, {
          expiresIn: '1d',
        })

        return done(null, { role: user.role, team: user.team, token })
      } catch (error) {
        return done(error)
      }
    }
  )
}

export function getJWTUserAuthenticationStrategy() {
  return new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (request, done) => {
      try {
        const { id } = request

        const [[userById]] = await getUserById(id)

        if (!userById) {
          return done(null, false, { message: 'Invalid authorization header', type: 'authorize' })
        }

        const { password, createdAt, updatedAt, ...user } = userById

        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  )
}

export function getJWTAdminAuthenticationStrategy() {
  return new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (request, done) => {
      try {
        const { id } = request

        const [[userById]] = await getUserById(id)

        if (!userById || userById.role !== 'admin') {
          return done(null, false, { message: 'Invalid authorization header', type: 'authorize' })
        }

        const { password, createdAt, updatedAt, ...user } = userById

        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  )
}
