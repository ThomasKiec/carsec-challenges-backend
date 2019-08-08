export function validateStudentEmail(email) {
  if (!email) {
    throw new Error('Email is undefined')
  }
  const [identifier] = email.split('@')[1].split('.')

  return identifier === 'st'
}
