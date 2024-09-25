import {createContext, useRef} from 'react';
import {Toast} from 'primereact/toast';
import {NotificationContextType} from './NotificationContextType';

export const NotificationContext = createContext<NotificationContextType>({
  notifySuccess: () => {},
  notifyInfo: () => {},
  notifyWarn: () => {},
  notifyError: () => {},
});

export const NotificationProvider = ({children}: any) => {
  const toast = useRef<Toast>(null);

  const notifyMessageSuccess = (message: string) => {
    toast?.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  };

  const notifyMessageInfo = (message: string) => {
    toast?.current?.show({
      severity: 'info',
      summary: 'Info',
      detail: message,
      life: 3000,
    });
  };

  const notifyMessageWarn = (message: string) => {
    toast?.current?.show({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: 3000,
    });
  };

  const notifyMessageError = (message: string) => {
    toast?.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifySuccess: notifyMessageSuccess,
        notifyInfo: notifyMessageInfo,
        notifyWarn: notifyMessageWarn,
        notifyError: notifyMessageError,
      }}>
      <Toast ref={toast} />
      {children}
    </NotificationContext.Provider>
  );
};
