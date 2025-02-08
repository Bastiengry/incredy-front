import {
  createContext,
} from 'react';
import Keycloak from 'keycloak-js';

interface KeycloakContextProps {
  keycloak: Keycloak | null;
  authenticated: boolean;
}

const KeycloakContext = createContext<KeycloakContextProps | undefined>(
  undefined,
);

export default KeycloakContext;
export type { KeycloakContextProps };
