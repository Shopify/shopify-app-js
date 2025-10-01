export function validateRequiredAccessToken(
  accessToken: string | undefined,
): asserts accessToken is string {
  if (!accessToken || accessToken.length === 0) {
    throw new Error(
      `${CLIENT}: access token must be provided`,
    );
  }
}

export function validateRequiredCustomerAccountId(
  customerAccountId: string | undefined,
): asserts customerAccountId is string {
  if (!customerAccountId || customerAccountId.length === 0) {
    throw new Error(
      `${CLIENT}: customerAccountId must be provided`,
    );
  }
}

const CLIENT = 'customer-account-api-client';