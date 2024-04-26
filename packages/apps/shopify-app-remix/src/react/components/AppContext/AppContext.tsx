import {createContext, useContext} from 'react';

interface AppContext {
  baseAuthPath: string;
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
