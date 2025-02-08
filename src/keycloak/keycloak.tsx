import Keycloak from 'keycloak-js';

/* eslint-disable  @typescript-eslint/no-explicit-any */
const keycloackConfig = {
  realm: (window as any).APP_CONFIG.KEYCLOAK_REALM || '',
  url: (window as any).APP_CONFIG.KEYCLOAK_URL,
  clientId: (window as any).APP_CONFIG.KEYCLOAK_CLIENT_ID || '',
};

const keycloak = new Keycloak(keycloackConfig);

export default keycloak;
