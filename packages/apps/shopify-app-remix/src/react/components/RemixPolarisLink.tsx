import React from 'react';
import {Link} from '@remix-run/react';
// Polaris' LinkProps doesn't match this type, so we need to import it directly
import type {
  LinkLikeComponent,
  LinkLikeComponentProps,
} from '@shopify/polaris/build/ts/src/utilities/link';

export const RemixPolarisLink = React.forwardRef<
  HTMLAnchorElement,
  LinkLikeComponentProps
>((props, ref) => (
  <Link {...props} to={props.url ?? props.to} ref={ref} />
)) as LinkLikeComponent;
