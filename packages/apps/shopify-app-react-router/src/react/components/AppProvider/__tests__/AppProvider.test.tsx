import {mount} from '@shopify/react-testing';
import {MemoryRouter} from 'react-router-dom';

import '../../../__tests__/test-helper';

import {AppProvider} from '../AppProvider';

// Mock react-router's useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

describe('<AppProvider />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mountWithRouter = (children: React.ReactNode) => {
    return mount(<MemoryRouter>{children}</MemoryRouter>);
  };

  describe.each([
    [false, undefined],
    [undefined, undefined],
  ])('when embedded is %s & apiKey is %s', (embedded, apiKey) => {
    it('renders children', () => {
      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded={embedded as any} apiKey={apiKey as any}>
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(component).not.toContainReactComponent('script', {
        src: 'https://cdn.shopify.com/shopifycloud/app-bridge.js',
      });
      expect(component).toContainReactHtml('Hello world');
    });

    it('renders the app-bridge-ui-experimental script', () => {
      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded={embedded as any} apiKey={apiKey as any}>
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(component).toContainReactComponent('script', {
        src: 'https://cdn.shopify.com/shopifycloud/app-bridge-ui-experimental.js',
      });
    });

    it('does not render the app bridge script', () => {
      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded={embedded as any} apiKey={apiKey as any}>
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(component).not.toContainReactComponent('script', {
        src: 'https://cdn.shopify.com/shopifycloud/app-bridge.js',
      });
    });
  });

  describe('when embedded is true & apiKey is provided', () => {
    it('renders children', () => {
      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded apiKey="test-api-key">
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(component).toContainReactHtml('Hello world');
    });

    it('renders the app-bridge-ui-experimental script', () => {
      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded apiKey="test-api-key">
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(component).toContainReactComponent('script', {
        src: 'https://cdn.shopify.com/shopifycloud/app-bridge-ui-experimental.js',
      });
    });

    it('renders the app bridge script', () => {
      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded apiKey="test-api-key">
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(component).toContainReactComponent('script', {
        src: 'https://cdn.shopify.com/shopifycloud/app-bridge.js',
        'data-api-key': 'test-api-key',
      });
    });

    it('sets up navigation event listener', () => {
      // GIVEN
      const apiKey = 'test-api-key';
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      // WHEN
      mountWithRouter(
        <AppProvider embedded apiKey={apiKey}>
          <div>Hello world</div>
        </AppProvider>,
      );

      // THEN
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'shopify:navigate',
        expect.any(Function),
      );
    });

    it('handles navigation events correctly', () => {
      // GIVEN
      const apiKey = 'test-api-key';
      const handlers = {
        navigate: null as ((event: Event) => void) | null,
      };

      jest
        .spyOn(document, 'addEventListener')
        .mockImplementation((event, handler) => {
          if (event === 'shopify:navigate') {
            handlers.navigate = handler as (event: Event) => void;
          }
        });

      // WHEN
      mountWithRouter(
        <AppProvider embedded apiKey={apiKey}>
          <div>Hello world</div>
        </AppProvider>,
      );

      const mockEvent = {
        target: {
          getAttribute: jest.fn().mockReturnValue('/test-path'),
        },
      } as unknown as Event;

      handlers.navigate?.(mockEvent);

      // THEN
      expect(mockNavigate).toHaveBeenCalledWith('/test-path');
    });

    it('cleans up event listener on unmount', () => {
      // GIVEN
      const apiKey = 'test-api-key';
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener',
      );

      // WHEN
      const component = mountWithRouter(
        <AppProvider embedded apiKey={apiKey}>
          <div>Hello world</div>
        </AppProvider>,
      );

      component.unmount();

      // THEN
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'shopify:navigate',
        expect.any(Function),
      );
    });
  });
});
