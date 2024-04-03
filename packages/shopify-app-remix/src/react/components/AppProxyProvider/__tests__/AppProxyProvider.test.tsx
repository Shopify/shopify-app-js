import {useContext} from 'react';
import {mount} from '@shopify/react-testing';

import '../../../__tests__/test-helper';

import {AppProxyProvider, AppProxyProviderContext} from '../AppProxyProvider';

describe('<AppProxy />', () => {
  const defaultProps = {
    appUrl: 'test_app_url',
  };

  it('renders the script tag if the embedded app prop is passed in', () => {
    // WHEN
    const component = mount(
      <AppProxyProvider {...defaultProps}>Hello world</AppProxyProvider>,
    );

    // THEN
    expect(component).toContainReactComponent('base', {
      href: defaultProps.appUrl,
    });
    expect(component).toContainReactHtml('Hello world');
  });
});

describe('formatUrl', () => {
  function TestComponent({url}: {url?: string}) {
    const context = useContext(AppProxyProviderContext);

    return <div>{context?.formatUrl(url)}</div>;
  }

  it('returns undefined if no URL is given', () => {
    // WHEN
    const component = mount(
      <AppProxyProvider appUrl="test_url">
        <TestComponent url={undefined} />
      </AppProxyProvider>,
    );

    // THEN
    expect(component.findAll('div')![0].text()).toBe('');
  });
});
