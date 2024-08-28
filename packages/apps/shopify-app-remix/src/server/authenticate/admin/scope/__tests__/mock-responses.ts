export const WITH_GRANTED_AND_DECLARED = buildGraphqlResponseContent({
  app: {
    requestedAccessScopes: [
      {
        handle: 'read_orders',
      },
      {
        handle: 'read_reports',
      },
    ],
    optionalAccessScopes: [
      {
        handle: 'write_customers',
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
  appRevokeAccessScopes: {
    revoked: [
      {
        handle: 'write_discounts',
      },
      {
        handle: 'read_orders',
      },
    ],
    userErrors: [],
  },
});

export const REVOKED_NOTHING = buildGraphqlResponseContent({
  appRevokeAccessScopes: {
    revoked: [],
    userErrors: [],
  },
});

export const REVOKED_WITH_ERROR = buildGraphqlResponseContent({
  appRevokeAccessScopes: {
    revoked: null,
    userErrors: [
      {
        field: 'scopes',
        messages:
          'The requested list of scopes to revoke includes invalid handles.',
      },
    ],
  },
});

function buildGraphqlResponseContent(content: any) {
  return JSON.stringify({
    data: {
      ...content,
    },
  });
}
