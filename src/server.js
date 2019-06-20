import bodyParser from 'body-parser'
import { challengeService } from './handler/challenge-service'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { initializePassportStrategies } from './lib/passport/initialize'
import passport from 'passport'
import { userChallengeService } from './handler/user-challenge-service'
import { userService } from './handler/user-service'

const app = express()
app.server = http.createServer(app)
app.server.listen(process.env.PORT, 'localhost')
app.server.listen(process.env.PORT)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())

app.use('/users', userService())
app.use('/challenges', challengeService())
app.use('/user-challenge', userChallengeService())

initializePassportStrategies()

console.log(`API started on localhost:${process.env.PORT}`)
