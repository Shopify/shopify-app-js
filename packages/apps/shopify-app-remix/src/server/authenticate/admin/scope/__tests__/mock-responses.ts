export const WITH_GRANTED_AND_DECLARED = buildGraphqlResponseContent({
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
});

export const REVOKED_WITHOUT_ERROR = buildGraphqlResponseContent({
  revoked: [
    {
      handle: 'read_orders',
    },
  ],
});

export const REVOKED_WITH_ERROR = buildGraphqlResponseContent({
  userErrors: [
    {
      field: 'scopes',
      messages:
        'The requested list of scopes to revoke includes invalid handles.',
    },
  ],
});

function buildGraphqlResponseContent(content: any) {
  return JSON.stringify({
    data: {
      ...content,
    },
  });
}
