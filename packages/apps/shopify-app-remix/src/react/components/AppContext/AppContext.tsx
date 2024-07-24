import {createContext, useContext} from 'react';

export interface ScopesApiConfig {
  basePath: string;
  requestPath: string;
  queryPath: string;
}

interface AppContext {
  scopesApi: ScopesApiConfig;
  isEmbeddedApp: boolean;
}

export const AppContext = createContext<AppContext | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
