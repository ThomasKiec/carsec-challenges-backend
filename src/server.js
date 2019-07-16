import { CronJob } from 'cron'
import bodyParser from 'body-parser'
import { buildUserChallenges } from './lib/build-user-challenges'
import { challengeService } from './handler/challenge-service'
import cors from 'cors'
import express from 'express'
import { hardwareKeysService } from './handler/hardware-keys-service'
import http from 'http'
import { initializePassportStrategies } from './lib/passport/initialize'
import passport from 'passport'
import { teamService } from './handler/team-service'
import { userChallengeService } from './handler/user-challenge-service'
import { userService } from './handler/user-service'

let buildCompleted = true
const cronJobBuildUserChallenges = new CronJob(
  '*/1 * * * *',
  async onCompleted => {
    if (buildCompleted) {
      buildCompleted = false

      const challenge = await buildUserChallenges(onCompleted)

      return challenge
    }
  },
  (completed, challenge, error) => {
    buildCompleted = completed
  }
)

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
app.use('/hardware-keys', hardwareKeysService())
app.use('/teams', teamService())

initializePassportStrategies()

cronJobBuildUserChallenges.start()

console.log(`API started on localhost:${process.env.PORT}`)
