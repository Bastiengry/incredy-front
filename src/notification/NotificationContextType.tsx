export interface NotificationContextType {
  notify: (type: 'ERROR' | 'INFO' | 'SUCCESS' | undefined, message: string) => void;
}
