import {HttpResponseError, InvalidJwtError} from '@shopify/shopify-api';
import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {testConfig, TEST_SHOP} from '../../__test-helpers';
import {deriveApi} from '../../shopify-app';
import {BasicParams} from '../../types';
import refreshToken from '../refresh-token';

describe('refreshToken', () => {
  let sessionStorage: MemorySessionStorage;
  let params: BasicParams;
  let mockRefreshToken: jest.Mock;

  beforeEach(() => {
    sessionStorage = new MemorySessionStorage();
    const config = testConfig({sessionStorage});

    mockRefreshToken = jest.fn();

    // Create api using deriveApi
    const api = deriveApi(config);

    // Create params with mocked api.auth.refreshToken
    params = {
      api: {
        ...api,
        auth: {
          ...api.auth,
          refreshToken: mockRefreshToken,
        },
      },
      config,
      logger: api.logger,
    } as unknown as BasicParams;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    it('successfully refreshes a token and returns a session', async () => {
      // GIVEN
      const refreshTokenValue = 'test-refresh-token';
      const newSession = setUpValidSessionImport({
        shop: TEST_SHOP,
        expires: new Date(Date.now() + 86400000),
        refreshToken: 'new-refresh-token',
        isOnline: false,
        accessToken: 'new-access-token',
      });

      mockRefreshToken.mockResolvedValue({session: newSession});

      // WHEN
      const result = await refreshToken(params, TEST_SHOP, refreshTokenValue);

      // THEN
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(mockRefreshToken).toHaveBeenCalledWith({
        shop: TEST_SHOP,
        refreshToken: refreshTokenValue,
      });
    });

    describe('error handling', () => {
      it('rethrows InvalidJwtError', async () => {
        // GIVEN
        const refreshTokenValue = 'invalid-jwt-refresh-token';
        const jwtError = new InvalidJwtError('Invalid JWT token');

        mockRefreshToken.mockRejectedValue(jwtError);

        // WHEN & THEN
        await expect(
          refreshToken(params, TEST_SHOP, refreshTokenValue),
        ).rejects.toThrow(InvalidJwtError);

        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: refreshTokenValue,
        });
      });

      it('rethrows HttpResponseError with code 400 and error "invalid_subject_token"', async () => {
        // GIVEN
        const refreshTokenValue = 'invalid-subject-token';
        const httpError = new HttpResponseError({
          message: 'Invalid subject token',
          code: 400,
          statusText: 'Bad Request',
          body: {error: 'invalid_subject_token'},
        });

        mockRefreshToken.mockRejectedValue(httpError);

        // WHEN & THEN
        await expect(
          refreshToken(params, TEST_SHOP, refreshTokenValue),
        ).rejects.toThrow(HttpResponseError);

        const error = await refreshToken(
          params,
          TEST_SHOP,
          refreshTokenValue,
        ).catch((err) => err);

        expect(error).toBeInstanceOf(HttpResponseError);
        expect(error.response.code).toBe(400);
        expect(error.response.body?.error).toBe('invalid_subject_token');
      });

      it('throws Response with status 500 for HttpResponseError with code 500', async () => {
        // GIVEN
        const refreshTokenValue = 'server-error-token';
        const httpError = new HttpResponseError({
          message: 'Internal Server Error',
          code: 500,
          statusText: 'Internal Server Error',
          body: {error: 'server_error'},
        });

        mockRefreshToken.mockRejectedValue(httpError);

        // WHEN & THEN
        await expect(
          refreshToken(params, TEST_SHOP, refreshTokenValue),
        ).rejects.toBeInstanceOf(Response);

        const error = await refreshToken(
          params,
          TEST_SHOP,
          refreshTokenValue,
        ).catch((err) => err);

        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      });

      it('throws Response with status 500 for generic errors', async () => {
        // GIVEN
        const refreshTokenValue = 'generic-error-token';
        const genericError = new Error('Something went wrong');

        mockRefreshToken.mockRejectedValue(genericError);

        // WHEN & THEN
        await expect(
          refreshToken(params, TEST_SHOP, refreshTokenValue),
        ).rejects.toBeInstanceOf(Response);

        const error = await refreshToken(
          params,
          TEST_SHOP,
          refreshTokenValue,
        ).catch((err) => err);

        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      });
    });
  });
});
