/* eslint-disable no-nested-ternary */
import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
// import {useNavigate} from '@remix-run/react';
import {Modal, Spinner} from '@shopify/polaris';

import {useAppContext} from '../AppContext';
import {ScopesInformation} from '../../../server/authenticate/admin/scope/types';
import {defer} from '../../utilities';

interface RequestScopesConfig {
  modal?: boolean;
}

export interface RequestScopesResponse {
  status: 'not-supported' | 'already-granted' | 'granted';
}

export interface RequestScopesParams {
  scopes: string[];
  config?: RequestScopesConfig;
}
interface OptionalScopesContextProps {
  requestScopes: (
    params: RequestScopesParams,
  ) => Promise<RequestScopesResponse>;
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
  const {scopesApi, isEmbeddedApp} = useAppContext();
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
  const currentScopesRef = useRef(currentScopes);
  currentScopesRef.current = currentScopes;
  const [providerConfig, setProviderConfig] = useState<
    RequestScopesConfig | undefined
  >(undefined);
  const deferredStatusReponse = useRef(defer<RequestScopesResponse>());

  const showModalEnabled = (config?: RequestScopesConfig) =>
    config?.modal !== false;

  const missingScopes = async (scopes: string[]) => {
    const {
      granted: {optional},
    } = await query!();
    return scopes.filter((scope) => !optional.includes(scope));
  };

  const scopesAlreadyGranted = async (scopes: string[]) => {
    const missing = await missingScopes(scopes);
    return missing.length === 0;
  };

  const query = async (): Promise<ScopesInformation> => {
    const response = await fetch(`${scopesApi.basePath}${scopesApi.queryPath}`);
    if (response.status === 200) {
      return response.json();
    }
    throw new Error('Failed to query scopes');
  };

  const requestScopes = async ({
    scopes,
    config,
  }: RequestScopesParams): Promise<RequestScopesResponse> => {
    // Compnent not supported for embedded apps. Once the app bridge api to request optioanl scopes is available,
    // it will be integrated here so the component can be used for embedded apps as well.
    if (isEmbeddedApp) return {status: 'not-supported'};

    setProviderConfig(config);
    setCurrentScopes(scopes);
    if (await scopesAlreadyGranted(scopes)) {
      return {status: 'already-granted'};
    } else if (showModalEnabled(config)) {
      setShowModal(true);
    } else {
      onConfirm();
    }

    // eslint-disable-next-line no-return-await
    return await deferredStatusReponse.current.promise;
  };

  const onConfirm = () => {
    setLoading(true);
    const width = 600;
    const height = 600;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;
    const authWindow = window.open(
      `${scopesApi.basePath}${scopesApi.requestPath}?scopes=${currentScopesRef.current}`,
      'Shopify - Grant Scopes',
      `scrollbars=no, resizable=no, width=${width}, height=${height}, top=${top}, left=${left}`,
    );
    setAuthWindow(authWindow);
  };

  const onCancel = () => {
    deferredStatusReponse.current.reject('grant-rejected');
    resetState();
  };

  const onOk = async () => {
    deferredStatusReponse.current.resolve({status: 'granted'});
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
    setCurrentScopes([]);
    setGranted(false);
    setTimeoutReached(false);
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

  // Check if the popup window page has been confirmed (requested scopes are granted)
  // Otherwise, after 60 seconds, the popup window is automatically closed
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (loading) {
      let count = 0;
      const interval = setInterval(async () => {
        if (await scopesAlreadyGranted(currentScopesRef.current)) {
          if (authWindow) authWindow.close();
          if (checkWindowClosed) clearInterval(checkWindowClosed);
          clearInterval(interval);
          setLoading(false);
          setGranted(true);
          if (!showModalEnabled(providerConfig)) {
            onOk();
          }
        } else if (count > 60) {
          if (authWindow) authWindow.close();
          if (checkWindowClosed) clearInterval(checkWindowClosed);
          clearInterval(interval);
          setLoading(false);
          setTimeoutReached(true);
          if (!showModalEnabled(providerConfig)) {
            onCancel();
          }
        }
        count++;
      }, 1000);

      setIntervalChecker(interval);
      return () => clearInterval(interval);
    }
  }, [loading, currentScopesRef]);

  // Check if the popup window has been closed manually
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (authWindow) {
      const checkWindowClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkWindowClosed);
          if (intervalChecker) clearInterval(intervalChecker);
          setLoading(false);
          setTimeoutReached(true);
          if (!showModalEnabled(providerConfig)) {
            onCancel();
          }
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
      'useOptionalScopes must be used within a OptionalScopesProvider',
    );
  }
  return context;
}
