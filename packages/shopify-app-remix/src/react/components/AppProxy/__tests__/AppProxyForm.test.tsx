import React from 'react';
import {RouterProvider, createMemoryRouter} from 'react-router-dom';
import {mount} from '@shopify/react-testing';

import '../../../__tests__/test-helper';

import {AppProxyForm} from '../AppProxyForm';

describe('<AppProxyForm />', () => {
  it('passes through with an empty action', () => {
    // WHEN
    const component = mount(
      <RouterProvider
        router={createMemoryRouter([
          {path: '/', element: <AppProxyForm>Hello world</AppProxyForm>},
        ])}
      />,
    );

    // THEN
    expect(component).toContainReactComponent('form', {action: '/'});
    expect(component).toContainReactHtml('Hello world');
  });

  it('adds a trailing slash if one is missing', () => {
    // WHEN
    const component = mount(
      <RouterProvider
        router={createMemoryRouter([
          {
            path: '/',
            element: (
              <AppProxyForm action="/my-action">Hello world</AppProxyForm>
            ),
          },
        ])}
      />,
    );

    // THEN
    expect(component).toContainReactComponent('form', {action: '/my-action/'});
    expect(component).toContainReactHtml('Hello world');
  });

  it("doesn't alter the action if it has a trailing slash", () => {
    // WHEN
    const component = mount(
      <RouterProvider
        router={createMemoryRouter([
          {
            path: '/',
            element: (
              <AppProxyForm action="/my-action/">Hello world</AppProxyForm>
            ),
          },
        ])}
      />,
    );

    // THEN
    expect(component).toContainReactComponent('form', {action: '/my-action/'});
    expect(component).toContainReactHtml('Hello world');
  });
});
