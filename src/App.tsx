import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/viva-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { routesConfig } from './router';
import { NotificationProvider } from './notification';
import './i18next';
import { KeycloakProvider } from './keycloak';

const router = createBrowserRouter(routesConfig);

function App() {
  return (
    <>
      <KeycloakProvider>
        <PrimeReactProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
        </PrimeReactProvider>
      </KeycloakProvider>
    </>
  );
}

export default App;
