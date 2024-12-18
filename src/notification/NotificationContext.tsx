import {createContext, ReactNode, useCallback, useRef} from 'react';
import {Toast} from 'primereact/toast';
import {NotificationContextType} from './NotificationContextType';

export const NotificationContext = createContext<NotificationContextType>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notify: () => {},
});



export const NotificationProvider = ({children}: {children: ReactNode}) => {
  const toast = useRef<Toast>(null);

  const notifyMessage = useCallback((type : 'ERROR' | 'INFO' | 'SUCCESS' | undefined, message: string) => {
    let severity: 'error' | 'success' | 'info';
    let summary;

    if (type==='ERROR') {
      severity='error';
      summary = 'Error'; 
    } else if (type==='SUCCESS') {
      severity='success';
      summary = 'Success'; 
    } else {
      severity='info';
      summary = 'Info';
    }

    toast?.current?.show({
      severity,
      summary,
      detail: message,
      life: 3000,
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notify: notifyMessage,
      }}>
      <Toast ref={toast} />
      {children}
    </NotificationContext.Provider>
  );
};
