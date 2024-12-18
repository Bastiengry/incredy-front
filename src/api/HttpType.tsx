export interface HttpOptions {
  headers: HeadersInit | undefined;
}

export interface NotificationMessage {
  type?: 'ERROR' | 'SUCCESS' | 'INFO';
  message: string;
};

export interface SimplifiedResponse {
  data?: object | undefined;
  messages?: NotificationMessage[];
  status: string;
}

export interface HttpHookType {
  httpGet: (url: string, options?: HttpOptions | undefined) => object;
  httpPut: (
    url: string,
    body?: object | undefined,
    options?: HttpOptions,
  ) => void;
  httpPost: (
    url: string,
    body?: object | undefined,
    options?: HttpOptions,
  ) => void;
  httpDelete: (url: string, options?: HttpOptions | undefined) => void;
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
