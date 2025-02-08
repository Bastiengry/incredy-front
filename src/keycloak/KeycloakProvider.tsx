import React, {
  useEffect,
  useState,
  useRef,
} from 'react';
import Keycloak from 'keycloak-js';
import keycloakInstance from './keycloak';
import KeycloakContext from './KeycloakContext';

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const isRun = useRef<boolean>(false);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    const initKeycloak = async () => {
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      keycloakInstance
        .init({
          onLoad: 'check-sso',
        })
        .then((authenticated: boolean) => {
          setAuthenticated(authenticated);
        })
        .catch((error: any) => {
          console.error('Keycloak initialization failed:', error);
          setAuthenticated(false);
        })
        .finally(() => {
          setKeycloak(keycloakInstance);
        });
    };

    initKeycloak();
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;
