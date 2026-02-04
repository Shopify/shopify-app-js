import {ConfigInterface} from '../../base-types';
import {DomainTransformation} from '../../types';
import {
  applyDomainTransformations,
  getTransformationDomains,
} from '../domain-transformer';

describe('applyDomainTransformations', () => {
  it('returns original domain when no transformations configured', () => {
    const config = {} as ConfigInterface;
    expect(applyDomainTransformations('shop1.myshopify.com', config)).toBe(
      'shop1.myshopify.com',
    );
  });

  it('returns original domain when transformations array is empty', () => {
    const config = {domainTransformations: []} as unknown as ConfigInterface;
    expect(applyDomainTransformations('shop1.myshopify.com', config)).toBe(
      'shop1.myshopify.com',
    );
  });

  it('applies template-based transformations', () => {
    const config = {
      domainTransformations: [
        {
          match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
          transform: '$1.dev-api.shop.dev',
        },
      ],
    } as ConfigInterface;

    expect(applyDomainTransformations('shop1.my.shop.dev', config)).toBe(
      'shop1.dev-api.shop.dev',
    );
  });

  it('applies function-based transformations', () => {
    const config = {
      domainTransformations: [
        {
          match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
          transform: (matches) => `${matches[1]}.api.example.com`,
        },
      ],
    } as ConfigInterface;

    expect(applyDomainTransformations('shop1.ui.example.com', config)).toBe(
      'shop1.api.example.com',
    );
  });

  it('returns original domain when no transformation matches', () => {
    const config = {
      domainTransformations: [
        {
          match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
          transform: '$1.dev-api.shop.dev',
        },
      ],
    } as ConfigInterface;

    expect(applyDomainTransformations('shop1.myshopify.com', config)).toBe(
      'shop1.myshopify.com',
    );
  });

  it('applies first matching transformation in order', () => {
    const config = {
      domainTransformations: [
        {
          match: /^test-.*\.ui\.example\.com$/,
          transform: (matches) => matches[0].replace('.ui.', '.staging-api.'),
        },
        {
          match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
          transform: '$1.api.example.com',
        },
      ],
    } as ConfigInterface;

    expect(applyDomainTransformations('test-shop.ui.example.com', config)).toBe(
      'test-shop.staging-api.example.com',
    );

    expect(applyDomainTransformations('shop1.ui.example.com', config)).toBe(
      'shop1.api.example.com',
    );
  });

  it('handles multiple capture groups in template', () => {
    const config = {
      domainTransformations: [
        {
          match: /^([a-zA-Z0-9-]+)-([a-z]+)\.admin\.example\.com$/,
          transform: '$1.$2.api.example.com',
        },
      ],
    } as ConfigInterface;

    expect(
      applyDomainTransformations('shop1-us.admin.example.com', config),
    ).toBe('shop1.us.api.example.com');
  });

  it('handles string regex patterns', () => {
    const config = {
      domainTransformations: [
        {
          match: '^([a-zA-Z0-9-_]+)\\.my\\.shop\\.dev$',
          transform: '$1.dev-api.shop.dev',
        },
      ],
    } as ConfigInterface;

    expect(applyDomainTransformations('shop1.my.shop.dev', config)).toBe(
      'shop1.dev-api.shop.dev',
    );
  });

  it('handles transformation function returning null', () => {
    const config = {
      domainTransformations: [
        {
          match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
          transform: () => null,
        },
      ],
    } as ConfigInterface;

    expect(
      applyDomainTransformations('shop1.ui.example.com', config),
    ).toBeNull();
  });
});

describe('getTransformationDomains', () => {
  it('returns empty array for empty transformations', () => {
    expect(getTransformationDomains([])).toEqual([]);
  });

  it('extracts source domain from regex pattern', () => {
    const transformations: DomainTransformation[] = [
      {
        match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
        transform: '$1.dev-api.shop.dev',
      },
    ];

    const domains = getTransformationDomains(transformations);
    expect(domains).toContain('my\\.shop\\.dev');
  });

  it('extracts target domain from template string', () => {
    const transformations: DomainTransformation[] = [
      {
        match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
        transform: '$1.dev-api.shop.dev',
      },
    ];

    const domains = getTransformationDomains(transformations);
    expect(domains).toContain('dev-api\\.shop\\.dev');
  });

  it('extracts domains from multiple transformations', () => {
    const transformations: DomainTransformation[] = [
      {
        match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
        transform: '$1.api.example.com',
      },
      {
        match: /^([a-zA-Z0-9-_]+)\.admin\.test\.com$/,
        transform: '$1.api.test.com',
      },
    ];

    const domains = getTransformationDomains(transformations);
    expect(domains).toContain('ui\\.example\\.com');
    expect(domains).toContain('api\\.example\\.com');
    expect(domains).toContain('admin\\.test\\.com');
    expect(domains).toContain('api\\.test\\.com');
  });

  it('handles string regex patterns', () => {
    const transformations: DomainTransformation[] = [
      {
        match: '^([a-zA-Z0-9-_]+)\\.custom\\.domain\\.com$',
        transform: '$1.api.domain.com',
      },
    ];

    const domains = getTransformationDomains(transformations);
    expect(domains).toContain('custom\\.domain\\.com');
    expect(domains).toContain('api\\.domain\\.com');
  });

  it('handles function-based transformations (no target extraction)', () => {
    const transformations: DomainTransformation[] = [
      {
        match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
        transform: (matches) => `${matches[1]}.api.example.com`,
      },
    ];

    const domains = getTransformationDomains(transformations);
    // Should extract source domain but not target (function-based)
    expect(domains).toContain('ui\\.example\\.com');
    // Target domain won't be extracted from function
  });
});
