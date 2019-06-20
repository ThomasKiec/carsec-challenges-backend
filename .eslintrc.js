module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    'jest/globals': true,
  },
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:flowtype/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'standard',
    'prettier',
  ],
  plugins: ['flow-check', 'flowtype', 'jest', 'prettier', 'require-path-exists'],
  rules: {
    quotes: ['error', 'single'],
    'array-bracket-spacing': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    curly: ['error', 'all'],
    'flow-check/check': ['warn'],
    'max-len': [
      'error',
      120,
      2,
      {
        ignoreRegExpLiterals: true,
        ignoreUrls: true,
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'require-await': 'error',
    'require-path-exists/notEmpty': 'error',
    'require-path-exists/tooManyArguments': 'error',
    'require-path-exists/exists': 'error',
    'prettier/prettier': ['error', require('./prettier.config')],
    'node/no-unpublished-require': 'off',
    'node/no-unsupported-features': 'off',
    'sort-keys': ['error', 'asc', { caseSensitive: true, natural: false }],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
}
