import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  realm: (window as any).APP_CONFIG.KEYCLOAK_REALM || '',
  url: (window as any).APP_CONFIG.KEYCLOAK_URL,
  clientId: (window as any).APP_CONFIG.KEYCLOAK_CLIENT_ID || '',
});

export default keycloak;
