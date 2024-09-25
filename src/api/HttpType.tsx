export type HttpOptions = {
  headers: HeadersInit | undefined;
};

export type SimplifiedResponse = {
  data?: any;
  messages?: Array<string>;
  status: string;
};

export type HttpHookType = {
  httpGet: (url: string, options?: HttpOptions | undefined) => any;
  httpPut: (
    url: string,
    body?: any | undefined,
    options?: HttpOptions | undefined,
  ) => void;
  httpPost: (
    url: string,
    body?: any | undefined,
    options?: HttpOptions | undefined,
  ) => void;
  httpDelete: (url: string, options?: HttpOptions | undefined) => void;
  httpGetSimple: (
    url: string,
    options?: HttpOptions | undefined,
  ) => Promise<SimplifiedResponse | undefined>;
  httpPutSimple: (
    url: string,
    body?: any | undefined,
    options?: HttpOptions | undefined,
  ) => Promise<SimplifiedResponse | undefined>;
  httpPostSimple: (
    url: string,
    body?: any | undefined,
    options?: HttpOptions | undefined,
  ) => Promise<SimplifiedResponse | undefined>;
};
