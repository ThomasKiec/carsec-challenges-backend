import { Router } from 'express'
import { createTeamRouter } from './create-team'
import { deleteTeamRouter } from './delete-team'
import { listTeamsRouter } from './list-teams'
import { listTeamsScoresRouter } from './list-teams-scores'

export function teamService() {
  const router = Router()

  createTeamRouter(router)
  deleteTeamRouter(router)
  listTeamsRouter(router)
  listTeamsScoresRouter(router)

  return router
}
