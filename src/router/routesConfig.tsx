import { Outlet } from 'react-router-dom';
import { Header } from '../components';
import { EditTopic, HomePage, ViewTopic } from '../pages';
import { PrivateRoute } from '.';

const routesConfig = [
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
];

export default routesConfig;
