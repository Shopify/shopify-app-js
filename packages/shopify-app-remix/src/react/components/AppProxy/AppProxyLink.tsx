import {useEffect, useState} from 'react';

export interface AppProxyLinkProps
  extends Omit<
    React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    'href'
  > {
  to: string;
}

export function AppProxyLink(props: AppProxyLinkProps) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);

  const {children, to, ...otherProps} = props;

  return (
    <a href={`${origin}${to.replace(/([^/])$/, '$1/')}`} {...otherProps}>
      {children}
    </a>
  );
}
