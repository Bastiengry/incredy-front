import { createContext, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { NotificationContextType } from './NotificationContextType';

export const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const toast = useRef<Toast>(null);

  const notifyMessage = useCallback((type: 'ERROR' | 'INFO' | 'SUCCESS' | undefined, message: string) => {
    let severity: 'error' | 'success' | 'info';
    let summary;

    if (type === 'ERROR') {
      severity = 'error';
      summary = 'Error';
    } else if (type === 'SUCCESS') {
      severity = 'success';
      summary = 'Success';
    } else {
      severity = 'info';
      summary = 'Info';
    }

    toast?.current?.show({
      severity,
      summary,
      detail: message,
      life: 3000,
    });
  }, []);

  const value = useMemo(() => ({
    notify: notifyMessage,
  }), [notifyMessage]);

  return (
    <NotificationContext.Provider
      value={value}
    >
      <Toast aria-label="notif-component" ref={toast} />
      {children}
    </NotificationContext.Provider>
  );
};
