import {Form, type FormProps} from '@remix-run/react';

export interface AppProxyFormProps extends FormProps {}

export function AppProxyForm(props: AppProxyFormProps) {
  const {children, action, ...otherProps} = props;

  return (
    <Form action={action && action.replace(/([^/])$/, '$1/')} {...otherProps}>
      {children}
    </Form>
  );
}
