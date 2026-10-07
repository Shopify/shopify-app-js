import {testConfig} from '../../__tests__/test-config';
import {LogSeverity} from '../../types';
import {generateLocalHmac, validateHmacString} from '../hmac-validator';
import {createSHA256HMAC} from '../../../runtime/crypto';
import {HashFormat} from '../../../runtime/crypto/types';

describe('validateHmacString', () => {
  const data = '{"foo":"bar"}';
  const primarySecret = 'new secret';
  const fallbackSecret = 'old secret';

  test('accepts a request signed with the fallback secret and logs a warning', async () => {
    const config = testConfig({
      apiSecretKey: primarySecret,
      apiSecretKeyFallback: fallbackSecret,
    });
    const fallbackHmac = await createSHA256HMAC(
      fallbackSecret,
      data,
      HashFormat.Base64,
    );

    await expect(
      validateHmacString(config, data, fallbackHmac, HashFormat.Base64),
    ).resolves.toBe(true);
    expect(config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Warning,
      expect.stringContaining('fallback'),
    );
  });

  test('accepts a request signed with the primary secret without a warning', async () => {
    const config = testConfig({
      apiSecretKey: primarySecret,
      apiSecretKeyFallback: fallbackSecret,
    });
    const primaryHmac = await createSHA256HMAC(
      primarySecret,
      data,
      HashFormat.Base64,
    );

    await expect(
      validateHmacString(config, data, primaryHmac, HashFormat.Base64),
    ).resolves.toBe(true);
    expect(config.logger.log).not.toHaveBeenCalled();
  });

  test('rejects a request signed by neither secret', async () => {
    const config = testConfig({
      apiSecretKey: primarySecret,
      apiSecretKeyFallback: fallbackSecret,
    });

    await expect(
      validateHmacString(config, data, 'invalid', HashFormat.Base64),
    ).resolves.toBe(false);
    expect(config.logger.log).not.toHaveBeenCalled();
  });

  test('does not accept the fallback secret when it is not configured', async () => {
    const config = testConfig({apiSecretKey: primarySecret});
    const fallbackHmac = await createSHA256HMAC(
      fallbackSecret,
      data,
      HashFormat.Base64,
    );

    await expect(
      validateHmacString(config, data, fallbackHmac, HashFormat.Base64),
    ).resolves.toBe(false);
    expect(config.logger.log).not.toHaveBeenCalled();
  });

  test('does not use the fallback secret for outbound request signing', async () => {
    const config = testConfig({
      apiSecretKey: primarySecret,
      apiSecretKeyFallback: fallbackSecret,
    });
    const expectedPrimaryHmac = await createSHA256HMAC(
      primarySecret,
      'foo=bar',
      HashFormat.Hex,
    );

    await expect(generateLocalHmac(config)({foo: 'bar'})).resolves.toBe(
      expectedPrimaryHmac,
    );
  });
});
