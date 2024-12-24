import { renderHook, waitFor } from '@testing-library/react';
import useHttp from './useHttp';
import { SimplifiedResponse } from './HttpType';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import ReactKeycloakWeb from '@react-keycloak/web';

const mockFetch = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: jest.fn().mockImplementation(() => ({
    keycloak: null,
  })),
}));

jest.mock('../AppConfConstants', () => ({
  APP_URL: '',
  APP_PREFIX: '',
}));

const getKeycloakInstance = ({
  authenticated = false,
  preferred_username = null,
  sub = undefined,
  token = undefined,
}: {
  authenticated?: boolean;
  preferred_username?: string | null;
  sub?: string | undefined;
  token?: string | undefined;
}): Keycloak => ({
  authenticated,
  tokenParsed: {
    preferred_username: preferred_username || null,
    sub: sub,
  },
  token,
  init: (): Promise<boolean> => new Promise(() => {}),
  login: (): Promise<void> => new Promise(() => {}),
  logout: (): Promise<void> => new Promise(() => {}),
  register: (): Promise<void> => new Promise(() => {}),
  accountManagement: (): Promise<void> => new Promise<void>(() => {}),
  createLoginUrl: () => '',
  createLogoutUrl: () => '',
  createRegisterUrl: () => '',
  createAccountUrl: () => '',
  isTokenExpired: () => false,
  updateToken: () => new Promise(() => {}),
  clearToken: () => {},
  hasRealmRole: () => true,
  hasResourceRole: () => false,
  loadUserProfile: (): Promise<KeycloakProfile> => new Promise(() => {}),
  loadUserInfo: (): Promise<object> => new Promise(() => {}),
});

describe('The useHttp hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('can send GET request', async () => {
    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpGet('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send POST request (with request data)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 201;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpPost('/api/v1/test', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send POST request (without request data)', async () => {
    const responseCode = 201;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpPost('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send PUT request (with request data)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpPut('/api/v1/test/1', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: { 'content-type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send PUT request (without request data)', async () => {
    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpPut('/api/v1/test/1');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: { 'content-type': 'application/json' },
          method: 'PUT',
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send DELETE request', async () => {
    const responseCode = 200;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'DELETE'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpDelete('/api/v1/test/1');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        expect.objectContaining({
          method: 'DELETE',
        }),
      ),
    );

    // Check the response of fetch
    expect(httpResponse.status).toEqual(responseCode);
  });

  it('can send GET request and get simple successful response', async () => {
    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpGetSimple('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('SUCCESS');
    expect(simplifiedResponse.data).toEqual(responseDataValue);
    expect(simplifiedResponse.messages).toEqual(responseMessages);
  });

  it('can send GET request and get simple successful response (no data, no message)', async () => {
    const responseCode = 200;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpGetSimple('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('SUCCESS');
  });

  it('can send GET request and get simple error response (no data, error message)', async () => {
    const responseCode = 400;

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpGetSimple('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('ERROR');
    expect(simplifiedResponse.messages).toEqual(responseMessages);
  });

  it('can send GET request and get simple error response (no data, no error message)', async () => {
    const responseCode = 400;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpGetSimple('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('ERROR');
  });

  it('can send POST request and get simple successful response', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 201;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the POST request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPostSimple('/api/v1/test', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('SUCCESS');
    expect(simplifiedResponse.data).toEqual(responseDataValue);
    expect(simplifiedResponse.messages).toEqual(responseMessages);
  });

  it('can send POST request and get simple successful response (no data, no message)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 201;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the POST request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPostSimple('/api/v1/test', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('SUCCESS');
  });

  it('can send POST request and get simple error response (no data, error message)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 400;

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the POST request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPostSimple('/api/v1/test', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('ERROR');
    expect(simplifiedResponse.messages).toEqual(responseMessages);
  });

  it('can send POST request and get simple error response (no data, no error message)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 400;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the POST request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPostSimple('/api/v1/test', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('ERROR');
  });

  it('can send PUT request and get simple successful response', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the PUT request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPutSimple('/api/v1/test/1', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: { 'content-type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('SUCCESS');
    expect(simplifiedResponse.data).toEqual(responseDataValue);
    expect(simplifiedResponse.messages).toEqual(responseMessages);
  });

  it('can send PUT request and get simple successful response (no data, no message)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 200;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the PUT request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPutSimple('/api/v1/test/1', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: { 'content-type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('SUCCESS');
  });

  it('can send PUT request and get simple error response (no data, error message)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 400;

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the PUT request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPutSimple('/api/v1/test/1', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: { 'content-type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('ERROR');
    expect(simplifiedResponse.messages).toEqual(responseMessages);
  });

  it('can send PUT request and get simple error response (no data, no error message)', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 400;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the PUT request.
    const simplifiedResponse: SimplifiedResponse = await result.current.httpPutSimple('/api/v1/test/1', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: { 'content-type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    expect(simplifiedResponse.status).toEqual('ERROR');
  });

  it('can send GET request with authentication token', async () => {
    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    const keycloakToken: string = '5144584983548';

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
      token: keycloakToken,
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the GET request.
    const httpResponse: Response = await result.current.httpGet('/api/v1/test');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + keycloakToken,
          },
          method: 'GET',
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send POST request with authentication token', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 201;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test'
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    const keycloakToken: string = '5144584983548';

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
      token: keycloakToken,
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the POST request.
    const httpResponse: Response = await result.current.httpPost('/api/v1/test', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test',
        {
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + keycloakToken,
          },
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send PUT request with authentication token', async () => {
    const requestData = {
      reqData: 'reqData',
    };

    const responseCode = 200;

    const responseDataValue = {
      data: 'data',
    };

    const responseMessages = [
      {
        type: 'SUCCESS',
        message: 'message 1',
      }, {
        type: 'ERROR',
        message: 'message 2',
      },
    ];

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'PUT'
      ) {
        return Promise.resolve({
          status: responseCode,
          json: () =>
            Promise.resolve({
              data: responseDataValue,
              messages: responseMessages,
            }),
        });
      }
      return null;
    });

    const keycloakToken: string = '5144584983548';

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
      token: keycloakToken,
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the PUT request.
    const httpResponse: Response = await result.current.httpPut('/api/v1/test/1', requestData);

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + keycloakToken,
          },
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      ),
    );

    // Check the response of fetch
    const responseData = await httpResponse.json();
    expect(httpResponse.status).toEqual(responseCode);
    expect(responseData.data).toEqual(responseDataValue);
    expect(responseData.messages).toEqual(responseMessages);
  });

  it('can send DELETE request with authentication token', async () => {
    const responseCode = 200;

    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === '/api/v1/test/1'
        && init?.method === 'DELETE'
      ) {
        return Promise.resolve({
          status: responseCode,
        });
      }
      return null;
    });

    const keycloakToken: string = '5144584983548';

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
      token: keycloakToken,
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // "Renders" the hook.
    const { result } = renderHook(useHttp);

    // Calls the DELETE request.
    const httpResponse: Response = await result.current.httpDelete('/api/v1/test/1');

    // Check the call of fetch
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/test/1',
        {
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + keycloakToken,
          },
          method: 'DELETE',
        },
      ),
    );

    // Check the response of fetch
    expect(httpResponse.status).toEqual(responseCode);
  });
});
