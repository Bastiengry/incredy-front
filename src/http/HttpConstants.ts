const HTTP_HEADER_PARAM_CONTENT_TYPE = 'content-type';
const HTTP_HEADER_PARAM_AUTHORIZATION = 'authorization';

const HTTP_HEADER_VALUE_CONTENT_TYPE_JSON = 'application/json';

const httpHeaderParamNames = {
  contentType: HTTP_HEADER_PARAM_CONTENT_TYPE,
  authorization: HTTP_HEADER_PARAM_AUTHORIZATION,
};

const httpHeaderValues = {
  applicationJson: HTTP_HEADER_VALUE_CONTENT_TYPE_JSON,
};

const defaultHeaders = {
  [HTTP_HEADER_PARAM_CONTENT_TYPE]: HTTP_HEADER_VALUE_CONTENT_TYPE_JSON,
};

const HttpConstants = {
  HTTP_HEADER_PARAM_CONTENT_TYPE,
  HTTP_HEADER_PARAM_AUTHORIZATION,
  HTTP_HEADER_VALUE_CONTENT_TYPE_JSON,
  httpHeaderParamNames,
  httpHeaderValues,
  defaultHeaders,
};

export default HttpConstants;
