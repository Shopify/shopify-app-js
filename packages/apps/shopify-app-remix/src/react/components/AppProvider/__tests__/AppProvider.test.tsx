import {mount} from '@shopify/react-testing';
import {AppProvider as PolarisAppProvider} from '@shopify/polaris';

import '../../../__tests__/test-helper';

import {AppProvider} from '../AppProvider';
import {RemixPolarisLink} from '../../RemixPolarisLink';

// Mock Remix's useNavigate hook
const mockNavigate = jest.fn();
jest.mock('@remix-run/react', () => ({
  ...jest.requireActual('@remix-run/react'),
  useNavigate: () => mockNavigate,
}));

describe('<AppProvider />', () => {
  const defaultProps = {
    apiKey: '123abc',
    isEmbeddedApp: true,
  };

  it('renders the script tag if the embedded app prop is passed in', () => {
    // WHEN
    const component = mount(
      <AppProvider {...defaultProps}>Hello world</AppProvider>,
    );

    // THEN
    expect(component).toContainReactComponent('script', {
      src: 'https://cdn.shopify.com/shopifycloud/app-bridge.js',
    });
    expect(component).toContainReactHtml('Hello world');
  });

  it('does not render the script tag if the embedded app prop is not passed in', () => {
    // WHEN
    const component = mount(
      <AppProvider {...defaultProps} isEmbeddedApp={false}>
        Hello world
      </AppProvider>,
    );

    // THEN
    expect(component).not.toContainReactComponent('script');
  });

  it('allows overriding the app bridge url', () => {
    // WHEN
    const component = mount(
      <AppProvider {...defaultProps} __APP_BRIDGE_URL="override">
        Hello world
      </AppProvider>,
    );

    // THEN
    expect(component).toContainReactComponent('script', {src: 'override'});
  });

  it('passes i18n and linkComponent props to the Polaris provider', () => {
    // WHEN
    const dummyI18n = {hello: 'world'};
    const component = mount(
      <AppProvider {...defaultProps} i18n={dummyI18n}>
        Hello world
      </AppProvider>,
    );

    // THEN
    expect(component).toContainReactComponent(PolarisAppProvider, {
      i18n: dummyI18n,
      linkComponent: RemixPolarisLink,
    });
  });

  it('handles "shopify:navigate" events correctly', () => {
    const component = mount(
      <AppProvider isEmbeddedApp apiKey={'test-api-key'}>
        <div>Hello world</div>
        <a
          data-testid="test-link"
          href="/test-path"
          onClick={(event) => {
            event.preventDefault();
            event.currentTarget.dispatchEvent(
              new CustomEvent('shopify:navigate', {
                bubbles: true,
                cancelable: true,
                composed: true,
              }),
            );
          }}
        >
          Test path
        </a>
      </AppProvider>,
    );

    component.find('a', {'data-testid': 'test-link'}).domNode.click();
    expect(mockNavigate).toHaveBeenCalledWith('/test-path');
  });
});
