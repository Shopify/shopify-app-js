/* eslint-disable no-nested-ternary */
import {useState, createContext, useContext, ReactNode, useEffect} from 'react';
// import {useNavigate} from '@remix-run/react';
import {Modal, Spinner} from '@shopify/polaris';

import {useScopesApi} from '../../clients';
import {useAppContext} from '../AppProvider';

interface OptionalScopesContextProps {
  requestScopes: (
    scopes: string[],
    onGrant: () => void,
    onAlreadyGranted?: () => void,
  ) => Promise<void>;
}

const OptionalScopesContext = createContext<
  OptionalScopesContextProps | undefined
>(undefined);

interface OptionalScopesProviderProps {
  children: ReactNode;
}

export function OptionalScopesProvider({
  children,
}: OptionalScopesProviderProps) {
  const {checkScopes} = useScopesApi();
  const {baseAuthPath} = useAppContext();
  const scopesApiPath = `${baseAuthPath}/scopes`;
  const [showModal, setShowModal] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);
  const [intervalChecker, setIntervalChecker] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [checkWindowClosed, setCheckWindowClosed] =
    useState<NodeJS.Timeout | null>(null);
  const [timeout, setTimeoutReached] = useState(false);
  const [currentScopes, setCurrentScopes] = useState<string[]>([]);
  const [onGrant, setOnGrant] = useState<(() => void) | null>(null);

  const requestScopes = async (
    scopes: string[],
    onGrant: () => void,
    onAlreadyGranted?: () => void,
  ) => {
    setCurrentScopes(scopes);
    setOnGrant(() => onGrant);
    const missingScopes = await checkScopes(scopes);
    if (missingScopes.length === 0) {
      if (onAlreadyGranted) {
        onAlreadyGranted();
      } else {
        onGrant();
      }
    } else {
      console.log('showModal');
      setShowModal(true);
    }
  };

  const onConfirm = () => {
    setLoading(true);
    const width = 600;
    const height = 600;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;
    const authWindow = window.open(
      `${scopesApiPath}/request?scopes=${currentScopes}`,
      'Shopify - Grant Scopes',
      `scrollbars=no, resizable=no, width=${width}, height=${height}, top=${top}, left=${left}`,
    );
    setAuthWindow(authWindow);
    // navigate(`/auth/scopes/request?scopes=${currentScopes}`);
  };

  const onCancel = () => {
    resetState();
  };

  const onOk = async () => {
    if (onGrant) {
      onGrant();
    }
    resetState();
  };

  const resetState = () => {
    if (intervalChecker) clearInterval(intervalChecker);
    setIntervalChecker(null);
    if (checkWindowClosed) clearInterval(checkWindowClosed);
    setCheckWindowClosed(null);
    setShowModal(false);
    if (authWindow) authWindow.close();
    setAuthWindow(null);
    setLoading(false);
    setGranted(false);
    setTimeoutReached(false);
    setCurrentScopes([]);
    setOnGrant(null);
  };

  const getTitle = () => {
    if (loading) return 'Confirm permissions';
    if (granted) return 'Permissions granted';
    if (timeout) return 'Problem with confirmation';
    return 'Missing permissions';
  };

  const getPrimaryAction = () => {
    if (granted) {
      return {
        content: 'Close',
        onAction: onOk,
      };
    }
    if (timeout) {
      return {
        content: 'Close',
        onAction: onCancel,
      };
    }
    if (!loading) {
      return {
        content: 'Confirm',
        onAction: onConfirm,
      };
    }
    return undefined;
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (loading) {
      let count = 0;
      const interval = setInterval(async () => {
        const missingScopes = await checkScopes(currentScopes);
        if (missingScopes.length === 0) {
          if (authWindow) authWindow.close();
          if (checkWindowClosed) clearInterval(checkWindowClosed);
          clearInterval(interval);
          setLoading(false);
          setGranted(true);
        } else if (count > 60) {
          if (authWindow) authWindow.close();
          if (checkWindowClosed) clearInterval(checkWindowClosed);
          clearInterval(interval);
          setLoading(false);
          setTimeoutReached(true);
        }
        count++;
      }, 1000);

      setIntervalChecker(interval);
      return () => clearInterval(interval);
    }
  }, [loading, currentScopes]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (authWindow) {
      const checkWindowClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkWindowClosed);
          if (intervalChecker) clearInterval(intervalChecker);
          setLoading(false);
          setTimeoutReached(true);
        }
      }, 1000);
      setCheckWindowClosed(checkWindowClosed);
      return () => clearInterval(checkWindowClosed);
    }
  }, [authWindow, intervalChecker]);

  return (
    <OptionalScopesContext.Provider value={{requestScopes}}>
      {children}
      <Modal
        open={showModal}
        onClose={onCancel}
        title={getTitle()}
        primaryAction={getPrimaryAction()}
        secondaryActions={
          !loading && !granted && !timeout
            ? [
                {
                  content: 'Cancel',
                  onAction: onCancel,
                },
              ]
            : undefined
        }
      >
        <Modal.Section>
          {loading ? (
            <>
              <Spinner size="small" accessibilityLabel="Spinner example" />
              <p>
                Please, grant the required permission in the opened window and
                come back here once it's done.
              </p>
            </>
          ) : granted ? (
            <>
              <p>You have granted the required scopes.</p>
            </>
          ) : timeout ? (
            <p>
              Unfortunately the permissions confirmation has not been completed.
              Please, close this banner and try it again later.
            </p>
          ) : (
            <p>
              You are missing some required permissions. Please confirm to
              request them.
            </p>
          )}
        </Modal.Section>
      </Modal>
    </OptionalScopesContext.Provider>
  );
}

export function useOptionalScopes() {
  const context = useContext(OptionalScopesContext);
  if (!context) {
    throw new Error(
      'useConditionChecker must be used within a ConditionCheckerProvider',
    );
  }
  return context;
}
