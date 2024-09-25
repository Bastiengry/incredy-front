import {HttpHookType, HttpOptions, SimplifiedResponse} from './HttpType';
import {useKeycloak} from '@react-keycloak/web';
import i18next from 'i18next';
import HttpConstants from './HttpConstants';
import {useCallback} from 'react';

const useHttp = (): HttpHookType => {
  const {keycloak} = useKeycloak();

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
        headers: {...HttpConstants.defaultHeaders},
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      const response: Response = await fetch(HttpConstants.APP_PREFIX + url, {
        headers: {
          ...authHeader,
          ...options?.headers,
        },
      });
      return response;
    },
    [buildAuthorizationHeader],
  );

  const httpPost = useCallback(
    async (
      url: string,
      body: any | undefined,
      options: HttpOptions | undefined = {
        headers: {...HttpConstants.defaultHeaders},
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      const finalBody = body ? JSON.stringify(body) : undefined;

      return await fetch(HttpConstants.APP_PREFIX + url, {
        body: finalBody,
        headers: {...authHeader, ...options?.headers},
        method: 'POST',
      });
    },
    [buildAuthorizationHeader],
  );

  const httpPut = useCallback(
    async (
      url: string,
      body: any | undefined,
      options: HttpOptions | undefined = {
        headers: {...HttpConstants.defaultHeaders},
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      const finalBody = body ? JSON.stringify(body) : undefined;

      return await fetch(HttpConstants.APP_PREFIX + url, {
        body: finalBody,
        headers: {...authHeader, ...options?.headers},
        method: 'PUT',
      });
    },
    [buildAuthorizationHeader],
  );

  const httpDelete = useCallback(
    async (
      url: string,
      options: HttpOptions | undefined = {
        headers: {...HttpConstants.defaultHeaders},
      },
    ) => {
      const authHeader = buildAuthorizationHeader();

      fetch(HttpConstants.APP_PREFIX + url, {
        headers: {...authHeader, ...options?.headers},
        method: 'DELETE',
      });
    },
    [buildAuthorizationHeader],
  );

  const simplifyResponse = useCallback(
    async (response: Response, successCode: number) => {
      let simplyResp: SimplifiedResponse;
      console.log('response', response);
      if (response && response.status === successCode) {
        try {
          const result = await response?.json();
          simplyResp = {
            data: result.data,
            messages: result.messages,
            status: 'SUCCESS',
          };
        } catch (e) {
          simplyResp = {
            status: 'SUCCESS',
          };
        }
      } else {
        if (response?.statusText) {
          simplyResp = {
            messages: [response.statusText],
            status: 'ERROR',
          };
        } else {
          simplyResp = {
            messages: [i18next.t('global.error.unexepectedError')],
            status: 'ERROR',
          };
        }
      }

      return simplyResp;
    },
    [],
  );

  const httpGetSimple = useCallback(
    async (
      url: string,
      options: HttpOptions | undefined = {
        headers: {...HttpConstants.defaultHeaders},
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
      options: HttpOptions | undefined = {
        headers: {...HttpConstants.defaultHeaders},
      },
    ) => {
      const response = await httpPut(url, options);
      return simplifyResponse(response, 200);
    },
    [httpPut, simplifyResponse],
  );

  const httpPostSimple = useCallback(
    async (
      url: string,
      options: HttpOptions | undefined = {
        headers: {...HttpConstants.defaultHeaders},
      },
    ) => {
      const response = await httpPost(url, options);
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
