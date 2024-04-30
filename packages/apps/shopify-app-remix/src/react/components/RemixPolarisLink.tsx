import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from '@remix-run/react';
// Polaris' LinkProps doesn't match this type, so we need to import it directly
import type {
  LinkLikeComponent,
  LinkLikeComponentProps,
} from '@shopify/polaris/build/ts/src/utilities/link';

export const RemixPolarisLink = React.forwardRef<
  HTMLAnchorElement,
  LinkLikeComponentProps
>((props, forwardedRef) => {
  const [element, setElement] = useState<HTMLElement>();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    async function onClick(event: Event) {
      const isAnchorTag = event.target instanceof HTMLAnchorElement;
      if (!hasAppBridgeCDN() || !isAnchorTag) return;

      const anchor = event.target;
      const url = parseUrl(anchor.href);
      if (!url || url.origin !== window.location.origin) return;

      const leaveConfirmation = getLeaveConfirmation();
      if (!leaveConfirmation) return;

      event.preventDefault();
      event.stopPropagation();

      await leaveConfirmation().catch(noop);

      const {pathname, search, hash} = url;
      navigateRef.current(`${pathname}${search}${hash}`);
    }
    element?.addEventListener('click', onClick);
    return () => {
      element?.removeEventListener('click', onClick);
    };
  }, [element]);

  return (
    <Link
      {...props}
      to={props.url ?? props.to}
      ref={(anchor) => {
        setElement(anchor || undefined);
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(anchor);
          } else {
            forwardedRef.current = anchor;
          }
        }
      }}
    />
  );
}) as LinkLikeComponent;

function parseUrl(url: string | undefined | null) {
  try {
    if (!url) return null;
    return new URL(url, window.location.origin);
  } catch (_) {
    return null;
  }
}

function hasAppBridgeCDN() {
  return 'shopify' in window;
}

const noop = () => {};

/**
 * Ref https://shopify.dev/docs/api/app-bridge-library/apis/navigation
 */
function getLeaveConfirmation(): () => Promise<void> {
  try {
    const shopify: any = 'shopify' in window ? window.shopify : undefined;
    const {leaveConfirmation} = shopify?.saveBar || {};
    if (typeof leaveConfirmation === 'function') {
      return () => leaveConfirmation();
    }
  } catch (_) {
    // Noop
  }
  return () => Promise.resolve();
}
