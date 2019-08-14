import { handleValidationResultError } from '../../src/middlewares/handle-validation-result-error'
import { validationResult } from 'express-validator/check'

jest.mock('express-validator/check')

describe('handle-validation-result-error', () => {
  const req = Symbol('req')

  const json = jest.fn()
  const status = jest.fn(() => ({ json }))
  const res = { status }

  const next = jest.fn()

  const type = Symbol('type')

  const errors = {
    array: jest.fn(),
    isEmpty: jest.fn(),
  }

  beforeAll(() => {
    validationResult.mockReturnValue(errors)
  })

  afterEach(() => {
    validationResult.mockClear()
    errors.isEmpty.mockReset()
    errors.array.mockReset()

    status.mockClear()
    json.mockReset()
  })

  it('calls next if no errors exist', () => {
    errors.isEmpty.mockReturnValueOnce(true)

    handleValidationResultError(req, res, next, type)

    expect(errors.isEmpty).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)

    expect(status).not.toHaveBeenCalled()
  })

  it('resolves with statusCode 422 if error exist', () => {
    const errorMessage = 'errorMessage'
    errors.isEmpty.mockReturnValueOnce(false)
    errors.array.mockReturnValueOnce([{ msg: errorMessage }, { msg: errorMessage }])

    handleValidationResultError(req, res, next, type)

    expect(errors.isEmpty).toHaveBeenCalledTimes(1)
    expect(errors.array).toHaveBeenCalledTimes(1)

    expect(status).toHaveBeenCalledTimes(1)
    expect(status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledTimes(1)
    expect(json).toHaveBeenCalledWith({
      message: `${errorMessage}, ${errorMessage}`,
      type,
    })
  })
})
