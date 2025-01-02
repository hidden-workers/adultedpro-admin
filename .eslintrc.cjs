// eslint-disable-next-line no-undef
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  env: {
    browser: true, // Defines browser globals
    es2021: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-explicit-any': 'off',
    'react/no-unescaped-entities': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
