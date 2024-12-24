// eslint-disable-next-line @typescript-eslint/no-explicit-any
const APP_URL = (window as any).APP_CONFIG.BACKEND_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const APP_PREFIX = (window as any).APP_CONFIG.BACKEND_PREFIX;

const AppConfConstants = {
  APP_URL,
  APP_PREFIX,
};

export default AppConfConstants;
