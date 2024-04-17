import {MissingScopesResponse} from 'src/server';

export async function getMissingScopesRedirection(
  response: Response,
): Promise<string | undefined> {
  if (response.ok) return;

  const responseData: MissingScopesResponse = await response.json();
  if (
    responseData.type !== 'missingScopes' ||
    responseData.data.scopes.length === 0
  )
    return;

  // eslint-disable-next-line consistent-return
  return `/auth/missingScopes?scopes=${responseData.data.scopes.join(',')}`;
}
