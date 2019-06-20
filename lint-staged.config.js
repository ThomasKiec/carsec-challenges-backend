module.exports = {
  '*.js': ['jest --bail --findRelatedTests', 'prettier --write', 'eslint --fix', 'git add'],
}
