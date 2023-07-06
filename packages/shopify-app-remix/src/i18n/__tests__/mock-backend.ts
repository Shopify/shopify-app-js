import {
  BackendModule,
  InitOptions,
  ReadCallback,
  Services,
  TOptions,
} from 'i18next';

export class MockBackend implements BackendModule {
  static type: 'backend' = 'backend';
  static readMock = jest.fn();

  services: Services;
  backendOptions: TOptions;
  i18nextOptions: InitOptions;

  constructor(public type: 'backend' = 'backend') {}

  init(
    services: Services,
    backendOptions: TOptions,
    i18nextOptions: InitOptions,
  ): void {
    this.services = services;
    this.backendOptions = backendOptions;
    this.i18nextOptions = i18nextOptions;
  }

  read(language: string, namespace: string, callback: ReadCallback) {
    return MockBackend.readMock(language, namespace, callback);
  }
}
