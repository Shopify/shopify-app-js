import {Form, type FormProps} from '@remix-run/react';

export interface AppProxyFormProps extends FormProps {}

/**
 * Sets up a `<form />` HTML element that works when rendered behind an app proxy.
 *
 * Supports any properties accepted by the `<form />` HTML element.
 *
 * @example
 * <caption>Render a form element in a proxied route.</caption>
 * <description>Use an `AppProxy.Form` within an `AppProxy` to create a form.</description>
 * ```ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProxy} from '@shopify/shopify-app-remix/react';
 *
 * export async function loader({ request }) {
 *   await authenticate.public.appProxy(request);
 *
 *   return json({ appUrl: process.env.SHOPIFY_APP_URL });
 * }
 *
 * export default function App() {
 *   const { appUrl } = useLoaderData();
 *
 *   return (
 *     <AppProxy appUrl={appUrl}>
 *       <AppProxy.Form action="/submit">
 *         <input type="text" name="name" />
 *
 *         <input type="submit" name="Submit" />
 *       </AppProxy.Form>
 *     </AppProxy>
 *   );
 * }
 * ```
 */
export function AppProxyForm(props: AppProxyFormProps) {
  const {children, action, ...otherProps} = props;

  return (
    <Form action={action && action.replace(/([^/])$/, '$1/')} {...otherProps}>
      {children}
    </Form>
  );
}
