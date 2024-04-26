import {useAppContext} from '../components';

export const useScopesApi = () => {
  const {baseAuthPath} = useAppContext();
  const scopesApiPath = `${baseAuthPath}/scopes`;

  const checkScopes = async (scopes: string[]) => {
    const response = await fetch(
      `${scopesApiPath}/check?scopes=${scopes.join(',')}`,
    );
    if (response.status === 200) {
      const responseContent = (await response.json()) as unknown as {
        missingScopes: string[];
      };
      return responseContent.missingScopes || [];
    }
    return [];
  };

  const revokeScopes = async (scopes: string[]) => {
    const response = await fetch(
      `${scopesApiPath}/revoke?scopes=${scopes.join(',')}`,
    );
    if (response.status === 200) {
      return true;
    }
    throw new Error('Failed to revoke scopes');
  };

  return {checkScopes, revokeScopes};
};
