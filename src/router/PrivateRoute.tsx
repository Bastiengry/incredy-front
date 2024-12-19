import { useKeycloak } from '@react-keycloak/web';
import { ReactNode } from 'react';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { keycloak } = useKeycloak();
  return (
    <>
      {
        !!keycloak?.authenticated && children
      }
    </>
  );
};

export default PrivateRoute;
