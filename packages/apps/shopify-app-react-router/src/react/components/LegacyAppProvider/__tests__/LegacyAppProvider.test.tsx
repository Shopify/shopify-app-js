import {mount} from '@shopify/react-testing';
import {AppProvider as PolarisAppProvider} from '@shopify/polaris';

import '../../../__tests__/test-helper';

import {LegacyAppProvider} from '../LegacyAppProvider';
import {ReactRouterPolarisLink} from '../../ReactRouterPolarisLink';

describe('<LegacyAppProvider />', () => {
  const defaultProps = {
    apiKey: '123abc',
    isEmbeddedApp: true,
  };

  it('renders the script tag if the embedded app prop is passed in', () => {
    // WHEN
    const component = mount(
      <LegacyAppProvider {...defaultProps}>Hello world</LegacyAppProvider>,
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
      <LegacyAppProvider {...defaultProps} isEmbeddedApp={false}>
        Hello world
      </LegacyAppProvider>,
    );

    // THEN
    expect(component).not.toContainReactComponent('script');
  });

  it('allows overriding the app bridge url', () => {
    // WHEN
    const component = mount(
      <LegacyAppProvider {...defaultProps} __APP_BRIDGE_URL="override">
        Hello world
      </LegacyAppProvider>,
    );

    // THEN
    expect(component).toContainReactComponent('script', {src: 'override'});
  });

  it('passes i18n and linkComponent props to the Polaris provider', () => {
    // WHEN
    const dummyI18n = {hello: 'world'};
    const component = mount(
      <LegacyAppProvider {...defaultProps} i18n={dummyI18n}>
        Hello world
      </LegacyAppProvider>,
    );

    // THEN
    expect(component).toContainReactComponent(PolarisAppProvider, {
      i18n: dummyI18n,
      linkComponent: ReactRouterPolarisLink,
    });
  });
});
