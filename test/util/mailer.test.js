import { sendPasswordResetEmail, sendSignupEmail } from '../../src/util/mailer'
import { createTransport } from 'nodemailer'

jest.mock('nodemailer')

describe('mailer', () => {
  const email = 'email'
  const password = 'password'

  const emailPassword = 'emailPassword'
  const emailUser = 'emailUser'

  const sendMail = jest.fn()

  beforeAll(() => {
    createTransport.mockImplementation(() => ({ sendMail }))

    process.env.EMAIL_PASSWORD = emailPassword
    process.env.EMAIL_USER = emailUser
  })

  afterEach(() => {
    createTransport.mockClear()
    sendMail.mockReset()
  })

  afterAll(() => {
    delete process.env.EMAIL_PASSWORD
    delete process.env.EMAIL_USER
  })

  describe('sendSignupEmail', () => {
    it('sends e-mail and resolves info if email and password are given', async () => {
      const test = Symbol('info')
      sendMail.mockResolvedValueOnce(test)

      await expect(sendSignupEmail(email, password)).resolves.toEqual(test)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: emailPassword, user: emailUser },
        service: 'Gmail',
      })

      expect(sendMail).toHaveBeenCalledTimes(1)
    })

    it('throws error if createTransport fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      createTransport.mockImplementationOnce(() => {
        throw error
      })

      await expect(sendSignupEmail(email, password)).rejects.toEqual(error)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: emailPassword, user: emailUser },
        service: 'Gmail',
      })

      expect(sendMail).not.toHaveBeenCalled()
    })

    it('throws error if sendMail fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      sendMail.mockRejectedValueOnce(error)

      await expect(sendSignupEmail(email, password)).rejects.toEqual(error)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: emailPassword, user: emailUser },
        service: 'Gmail',
      })

      expect(sendMail).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('sends e-mail and resolves info if email and password are given', async () => {
      const test = Symbol('info')
      sendMail.mockResolvedValueOnce(test)

      await expect(sendPasswordResetEmail(email, password)).resolves.toEqual(test)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: emailPassword, user: emailUser },
        service: 'Gmail',
      })

      expect(sendMail).toHaveBeenCalledTimes(1)
    })

    it('throws error if createTransport fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      createTransport.mockImplementationOnce(() => {
        throw error
      })

      await expect(sendPasswordResetEmail(email, password)).rejects.toEqual(error)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: emailPassword, user: emailUser },
        service: 'Gmail',
      })

      expect(sendMail).not.toHaveBeenCalled()
    })

    it('throws error if sendMail fails', async () => {
      const error = new Error(' ¯\\_(ツ)_/¯')

      sendMail.mockRejectedValueOnce(error)

      await expect(sendPasswordResetEmail(email, password)).rejects.toEqual(error)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(createTransport).toHaveBeenCalledWith({
        auth: { pass: emailPassword, user: emailUser },
        service: 'Gmail',
      })

      expect(sendMail).toHaveBeenCalledTimes(1)
    })
  })
})
