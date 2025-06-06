import {mount} from '@shopify/react-testing';
import {createRemixStub} from '@remix-run/testing';

import '../../../__tests__/test-helper';

import {AppProxyForm} from '../AppProxyForm';
import {AppProxyProvider} from '../../AppProxyProvider';

describe('<AppProxyForm />', () => {
  it('throws an error if used outside of an AppProxyProvider', () => {
    // GIVEN
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // WHEN
    expect(() =>
      mount(<AppProxyForm action="/my-action">Hello world</AppProxyForm>),
    ).toThrow('AppProxyForm must be used within an AppProxyProvider component');
  });

  it('adds a trailing slash if one is missing', () => {
    // WHEN
    function MyComponent() {
      return (
        <AppProxyProvider appUrl="http://my-app.example.io">
          <AppProxyForm action="/my-action">Hello world</AppProxyForm>
        </AppProxyProvider>
      );
    }

    const RemixStub = createRemixStub([{path: '/', Component: MyComponent}]);
    const component = mount(<RemixStub />);

    // THEN
    expect(component).toContainReactComponent('form', {action: '/my-action/'});
    expect(component).toContainReactHtml('Hello world');
  });

  it("doesn't alter the action if it has a trailing slash", () => {
    // WHEN
    function MyComponent() {
      return (
        <AppProxyProvider appUrl="http://my-app.example.io">
          <AppProxyForm action="/my-action/">Hello world</AppProxyForm>
        </AppProxyProvider>
      );
    }

    const RemixStub = createRemixStub([{path: '/', Component: MyComponent}]);
    const component = mount(<RemixStub />);

    // THEN
    expect(component).toContainReactComponent('form', {action: '/my-action/'});
    expect(component).toContainReactHtml('Hello world');
  });
});
