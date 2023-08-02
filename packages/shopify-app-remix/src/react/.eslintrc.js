module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../server/*'],
            message:
              'Importing from src/server in src/react is not allowed as they must be kept separate',
          },
        ],
      },
    ],
  },
};
