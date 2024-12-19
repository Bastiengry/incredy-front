import { createBrowserRouter, Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { EditTopic, HomePage, ViewTopic } from '../pages';
import { Header } from '../components';

const router = createBrowserRouter([
  {
    element: (
      <>
        <Header />
        <Outlet />
      </>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/edittopic/:topicId',
        element: (
          <PrivateRoute>
            <EditTopic />
          </PrivateRoute>
        ),
      },
      {
        path: '/viewtopic/:topicId',
        element: <ViewTopic />,
      },
    ],
  },
]);

export default router;
