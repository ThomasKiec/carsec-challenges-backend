export function validateStudentEmail(email) {
  const [identifier] = email.split('@')[1].split('.')

  return identifier === 'st'
}
