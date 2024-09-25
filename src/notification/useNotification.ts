import {useContext} from 'react';
import {NotificationContext} from '.';

export default function useNotification() {
  return useContext(NotificationContext);
}
