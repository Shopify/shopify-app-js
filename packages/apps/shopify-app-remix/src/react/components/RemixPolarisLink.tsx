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
>((props, ref) => {
  const {url, external, ...otherProps} = props;

  // Handle external links with target="_blank"
  if (url && external) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        {...otherProps}
        ref={ref}
      >
        {props.children}
      </a>
    );
  }

  // Use Remix Link for internal routing
  return <Link {...otherProps} to={url ?? props.to} ref={ref} />;
}) as LinkLikeComponent;
