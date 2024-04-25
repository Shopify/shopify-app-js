export const checkScopes = async (scopes: string[]) => {
  const response = await fetch(`/auth/scopes/check?scopes=${scopes.join(',')}`);
  if (response.status === 200) {
    const responseContent = (await response.json()) as unknown as {
      missingScopes: string[];
    };
    return responseContent.missingScopes || [];
  }
  return [];
};
