import { validateStudentEmail } from '../../src/util/validate-email'

describe('validate-email', () => {
  const validEmail = 'muster@st.oth-regensburg.de'
  const invalidEmail = 'mustermann@goolge.de'

  it('returns true if email matches university pattern', () => {
    expect(validateStudentEmail(validEmail)).toBeTruthy()

    expect(validateStudentEmail(invalidEmail)).toBeFalsy()
  })

  it('throws error if email is undefined', () => {
    const error = new Error('Email is undefined')

    expect(() => validateStudentEmail()).toThrow(error)
  })
})
