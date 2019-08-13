import { CronJob } from 'cron'
import bodyParser from 'body-parser'
import { buildUserChallenges } from './lib/build-user-challenges'
import { challengeService } from './handler/challenge-service'
import cors from 'cors'
import express from 'express'
import { hardwareKeysService } from './handler/hardware-keys-service'
import helmet from 'helmet'
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
  (completed, error) => {
    buildCompleted = completed
  }
)

const app = express()

app.use(cors())
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())

app.use('/api/users', userService())
app.use('/api/challenges', challengeService())
app.use('/api/user-challenge', userChallengeService())
app.use('/api/hardware-keys', hardwareKeysService())
app.use('/api/teams', teamService())

initializePassportStrategies()

// Handle production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(`${__dirname}/../public/`))

  app.get(/.*/, (req, res) => res.sendFile(`${__dirname}/../public/index.html`))
}

app.server = http.createServer(app)
app.server.listen(process.env.PORT, 'localhost')
app.server.listen(process.env.PORT)

cronJobBuildUserChallenges.start()

console.log(`API started on localhost:${process.env.PORT}`)
