export interface HttpOptions {
  headers: HeadersInit | undefined;
}

export interface HttpResponseMessage {
  type?: 'ERROR' | 'SUCCESS' | 'INFO';
  message: string;
};

export interface SimplifiedResponse {
  data?: object | undefined;
  messages?: HttpResponseMessage[];
  status: string;
}

export interface HttpHookType {
  httpGet: (url: string, options?: HttpOptions | undefined) => Promise<Response>;
  httpPut: (
    url: string,
    body?: object | undefined,
    options?: HttpOptions,
  ) => Promise<Response>;
  httpPost: (
    url: string,
    body?: object | undefined,
    options?: HttpOptions,
  ) => Promise<Response>;
  httpDelete: (url: string, options?: HttpOptions | undefined) => Promise<Response>;
  httpGetSimple: (
    url: string,
    options?: HttpOptions | undefined,
  ) => Promise<SimplifiedResponse>;
  httpPutSimple: (
    url: string,
    body?: object | undefined,
    options?: HttpOptions | undefined,
  ) => Promise<SimplifiedResponse>;
  httpPostSimple: (
    url: string,
    body?: object | undefined,
    options?: HttpOptions | undefined,
  ) => Promise<SimplifiedResponse>;
}
