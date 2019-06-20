import { validationResult } from 'express-validator/check'

export function handleValidationResultError(req, res, next, type) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let message

    for (const error of errors.array()) {
      if (!message) {
        message = error.msg
      } else {
        message += `, ${error.msg}`
      }
    }

    return res.status(422).json({
      message,
      type,
    })
  }

  next()
}
