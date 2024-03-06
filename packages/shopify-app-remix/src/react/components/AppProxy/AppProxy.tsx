import {AppProxyForm} from './AppProxyForm';
import {AppProxyLink} from './AppProxyLink';

export interface AppProxyProps {
  appUrl: string;
  children?: React.ReactNode;
}

export function AppProxy(props: AppProxyProps) {
  const {children, appUrl} = props;

  return (
    <>
      <base href={appUrl} />

      {children}
    </>
  );
}

AppProxy.Form = AppProxyForm;
AppProxy.Link = AppProxyLink;
