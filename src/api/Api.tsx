const Topic = {
  getAll: () => '/api/v1/topic',
  get: (topicId: string | number) => `/api/v1/topic/${topicId}`,
  create: () => `/api/v1/topic`,
  update: (topicId: string | number) => `/api/v1/topic/${topicId}`,
  delete: (topicId: string | number) => `/api/v1/topic/${topicId}`,
};

const Api = {
  Topic,
};

export default Api;
