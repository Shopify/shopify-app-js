import {ScopesInformation} from '../../server/authenticate/admin/scope/types';
// eslint-disable-next-line @shopify/strict-component-boundaries
import {useAppContext} from '../components/AppContext';

export const useScopesApi = () => {
  const {baseAuthPath, scopesApiSubpath} = useAppContext();
  const scopesApiPath = `${baseAuthPath}${scopesApiSubpath}`;

  const query = async (): Promise<ScopesInformation> => {
    const response = await fetch(`${scopesApiPath}/query`);
    if (response.status === 200) {
      return response.json();
    }
    throw new Error('Failed to query scopes');
  };

  const revoke = async (scopes: string[]): Promise<ScopesInformation> => {
    const response = await fetch(
      `${scopesApiPath}/revoke?scopes=${scopes.join(',')}`,
    );
    if (response.status === 200) {
      return response.json();
    }
    throw new Error('Failed to revoke scopes');
  };

  return {query, revoke};
};
