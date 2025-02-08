import { useKeycloak } from '../keycloak';
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
