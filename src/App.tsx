import { RouterProvider } from 'react-router-dom';
import { keycloak } from './security';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/viva-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { router } from './router';
import { NotificationProvider } from './notification';
import './i18next';

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <PrimeReactProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </PrimeReactProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
