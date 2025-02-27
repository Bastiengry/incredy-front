import { HttpHookType, HttpOptions, SimplifiedResponse } from './HttpType';
import { useKeycloak } from '../keycloak';
import HttpConstants from './HttpConstants';
import AppConfConstants from '../AppConfConstants';
import { useCallback } from 'react';

const useHttp = (): HttpHookType => {
  const { keycloak } = useKeycloak();

  const readAuthorizationHeaderValue = useCallback((): string | undefined => {
    let authorizationHeaderValue: string | undefined;
    if (keycloak?.token) {
      authorizationHeaderValue = `Bearer ${keycloak?.token}`;
    }
    return authorizationHeaderValue;
  }, [keycloak]);

  const buildAuthorizationHeader = useCallback((): HeadersInit | undefined => {
    let authHeaders: HeadersInit | undefined = undefined;

    const authHeaderValue: string | undefined = readAuthorizationHeaderValue();

    if (authHeaderValue) {
      authHeaders = {
        [HttpConstants.HTTP_HEADER_PARAM_AUTHORIZATION]: authHeaderValue,
      };
    }
    return authHeaders;
  }, [readAuthorizationHeaderValue]);

  const httpGet = useCallback(
    async (
      url: string,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      const response: Response = await fetch(
        (AppConfConstants.APP_URL || '') + (AppConfConstants.APP_PREFIX || '') + url,
        {
          headers: {
            ...authHeader,
            ...options?.headers,
          },
          method: 'GET',
        },
      );
      return response;
    },
    [buildAuthorizationHeader],
  );

  const httpPost = useCallback(
    async (
      url: string,
      body: object | undefined,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      const finalBody = body ? JSON.stringify(body) : undefined;

      return await fetch(
        (AppConfConstants.APP_URL || '') + (AppConfConstants.APP_PREFIX || '') + url,
        {
          body: finalBody,
          headers: { ...authHeader, ...options?.headers },
          method: 'POST',
        },
      );
    },
    [buildAuthorizationHeader],
  );

  const httpPut = useCallback(
    async (
      url: string,
      body: object | undefined,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      const finalBody = body ? JSON.stringify(body) : undefined;

      return await fetch(
        (AppConfConstants.APP_URL || '') + (AppConfConstants.APP_PREFIX || '') + url,
        {
          body: finalBody,
          headers: { ...authHeader, ...options?.headers },
          method: 'PUT',
        },
      );
    },
    [buildAuthorizationHeader],
  );

  const httpDelete = useCallback(
    async (
      url: string,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      return await fetch(
        (AppConfConstants.APP_URL || '') + (AppConfConstants.APP_PREFIX || '') + url,
        {
          headers: { ...authHeader, ...options?.headers },
          method: 'DELETE',
        },
      );
    },
    [buildAuthorizationHeader],
  );

  const simplifyResponse = useCallback(
    async (response: Response, successCode: number) => {
      let simplyResp: SimplifiedResponse;

      let statusAsText;
      if (response.status === successCode) {
        statusAsText = 'SUCCESS';
      } else {
        statusAsText = 'ERROR';
      }

      try {
        const result = await response.json();
        simplyResp = {
          data: result.data,
          messages: result.messages,
          status: statusAsText,
        };
      } catch {
        simplyResp = {
          status: statusAsText,
        };
      }

      return simplyResp;
    },
    [],
  );

  const httpGetSimple = useCallback(
    async (
      url: string,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const response = await httpGet(url, options);
      return simplifyResponse(response, 200);
    },
    [httpGet, simplifyResponse],
  );

  const httpPutSimple = useCallback(
    async (
      url: string,
      body?: object | undefined,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const response = await httpPut(url, body, options);
      return simplifyResponse(response, 200);
    },
    [httpPut, simplifyResponse],
  );

  const httpPostSimple = useCallback(
    async (
      url: string,
      body?: object | undefined,
      options: HttpOptions | undefined = {
        headers: { ...HttpConstants.defaultHeaders },
      },
    ) => {
      const response = await httpPost(url, body, options);
      return simplifyResponse(response, 201);
    },
    [httpPost, simplifyResponse],
  );

  return {
    httpGet,
    httpPut,
    httpPost,
    httpDelete,
    httpGetSimple,
    httpPutSimple,
    httpPostSimple,
  };
};

export default useHttp;
