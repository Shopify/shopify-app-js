module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../react/*'],
            message:
              'Importing from src/react in src/server is not allowed as they must be kept separate, because it breaks Remix bundling.',
          },
        ],
      },
    ],
  },
};
