export const WITH_GRANTED_AND_DECLARED = JSON.stringify({
  data: {
    app: {
      requestedAccessScopes: [
        {
          handle: 'write_orders',
        },
        {
          handle: 'read_reports',
        },
      ],
      installation: {
        accessScopes: [
          {
            handle: 'read_orders',
          },
          {
            handle: 'write_customers',
          },
        ],
      },
    },
  },
});
