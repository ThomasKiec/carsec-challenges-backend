import { createTransport } from 'nodemailer'
import { isTSAnyKeyword } from '@babel/types'
import { sendSignupEmail } from '../../src/util/mailer'

const transporter = {
    createTransport: jest.fn(() => ({ sendMail: jest.fn() }))
}
jest.mock('nodemailer', transporter)

describe('mailer', () => {
    const mailer = createTransport.mock.results[]

    console.log(mailer)

    const email = 'email'
    const password = 'password'

    const info = Symbol('info')

    afterEach(() => {
        mailer.sendMail.mockReset()
    })

    it('sends mail if email and password are given', async () => {
        mailer.mockResolvedValueOnce(info)

        await expect(sendSignupEmail(email, password)).resolves.toBe(info)
    })
})